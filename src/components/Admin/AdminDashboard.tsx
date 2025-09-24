import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Activity, User, Stats } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import DepartmentAnalytics from './DepartmentAnalytics';

interface DerivedAdminRequest {
  id: string;
  requesterUid: string;
  requesterName: string;
  requesterEmail: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Complaint {
  id: string;
  studentUid: string;
  studentName: string;
  studentEmail: string;
  facultyId: string | null;
  message: string;
  status: 'open' | 'resolved';
  adminRemarks?: string;
  createdAt?: { toDate?: () => Date } | Date;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalActivities: 0,
    pendingActivities: 0,
    approvedActivities: 0,
    rejectedActivities: 0,
    totalFaculty: 0
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [categoryData, setCategoryData] = useState<{[key: string]: number}>({});
  const [requests, setRequests] = useState<DerivedAdminRequest[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [adminReplyMap, setAdminReplyMap] = useState<Record<string, string>>({});

  const toJsDate = (value: Complaint['createdAt']): Date => {
    if (!value) return new Date(0);
    if (value instanceof Date) return value;
    const maybe = (value as { toDate?: () => Date }).toDate?.();
    return maybe || new Date(0);
  };

  useEffect(() => {
    // Listen to users collection
    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const users: User[] = [];
      snapshot.forEach((doc) => {
        users.push({ ...doc.data() } as User);
      });
      setAllUsers(users);
      
      setStats(prev => ({
        ...prev,
        totalStudents: users.filter(u => u.role === 'student').length,
        totalFaculty: users.filter(u => u.role === 'faculty').length
      }));
    });

    // Listen to activities collection
    const activitiesQuery = query(collection(db, 'activities'));
    const unsubscribeActivities = onSnapshot(activitiesQuery, (snapshot) => {
      const activities: Activity[] = [];
      const categories: {[key: string]: number} = {};
      
      snapshot.forEach((doc) => {
        const activity = { id: doc.id, ...doc.data() } as Activity;
        activities.push(activity);
        
        // Count categories
        categories[activity.category] = (categories[activity.category] || 0) + 1;
      });
      
      // Sort by most recent and take first 10
      const sortedActivities = activities
        .sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate())
        .slice(0, 10);
      
      setRecentActivities(sortedActivities);
      setCategoryData(categories);
      
      setStats(prev => ({
        ...prev,
        totalActivities: activities.length,
        pendingActivities: activities.filter(a => a.status === 'pending').length,
        approvedActivities: activities.filter(a => a.status === 'approved').length,
        rejectedActivities: activities.filter(a => a.status === 'rejected').length
      }));
    });

    const requestsQuery = query(collection(db, 'derivedAdminRequests'));
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const reqs: DerivedAdminRequest[] = [];
      snapshot.forEach((d) => reqs.push({ id: d.id, ...(d.data() as Omit<DerivedAdminRequest, 'id'>) }));
      setRequests(reqs);
    });

    // Listen to student complaints
    const complaintsQuery = query(collection(db, 'complaints'));
    const unsubscribeComplaints = onSnapshot(complaintsQuery, (snapshot) => {
      const list: Complaint[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...(d.data() as Omit<Complaint, 'id'>) }));
      setComplaints(list);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeActivities();
      unsubscribeRequests();
      unsubscribeComplaints();
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  };

  const approvalRate = stats.totalActivities > 0 
    ? ((stats.approvedActivities / (stats.approvedActivities + stats.rejectedActivities)) * 100).toFixed(1)
    : '0';

  const approveDerived = async (id: string, uid: string) => {
    await updateDoc(doc(db, 'users', uid), { role: 'derived-admin' });
    await updateDoc(doc(db, 'derivedAdminRequests', id), { status: 'approved' });
  };

  const rejectDerived = async (id: string) => {
    await updateDoc(doc(db, 'derivedAdminRequests', id), { status: 'rejected' });
  };

  const revokeDerived = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), { role: 'faculty' });
  };

  const grantDerived = async (uid: string) => {
    await updateDoc(doc(db, 'users', uid), { role: 'derived-admin' });
  };

  const updateComplaint = async (id: string, data: Partial<Pick<Complaint, 'status' | 'adminRemarks'>>) => {
    await updateDoc(doc(db, 'complaints', id), data);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Platform analytics and insights</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-blue-100 text-sm">Total Students</p>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-purple-100 text-sm">Total Activities</p>
              <p className="text-3xl font-bold">{stats.totalActivities}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-lg">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-green-100 text-sm">Approved</p>
              <p className="text-3xl font-bold">{stats.approvedActivities}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center">
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-orange-100 text-sm">Approval Rate</p>
              <p className="text-3xl font-bold">{approvalRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl p-6 glass-panel">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingActivities}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 glass-panel">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejectedActivities}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 glass-panel">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Faculty Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFaculty}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Analytics Section */}
      <DepartmentAnalytics />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Derived Admin Requests (Admins only) */}
        {user?.role === 'admin' && (
        <div className="rounded-xl border glass-panel">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Derived Admin Requests</h2>
            <p className="text-sm text-gray-600">Review and approve badge requests from faculty</p>
          </div>
          <div className="divide-y divide-gray-200">
            {requests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No requests</div>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.requesterName} ({r.requesterEmail})</p>
                    <p className="text-xs text-gray-600">Status: {r.status}</p>
                  </div>
                  {r.status === 'pending' && (
                    <div className="space-x-2">
                      <button onClick={() => approveDerived(r.id, r.requesterUid)} className="px-3 py-1 rounded-md bg-green-600 text-white text-sm">Approve</button>
                      <button onClick={() => rejectDerived(r.id)} className="px-3 py-1 rounded-md bg-red-600 text-white text-sm">Reject</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        )}
        {/* Category Distribution */}
        <div className="rounded-xl border glass-panel">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Category Distribution</h2>
            </div>
          </div>
          <div className="p-6">
            {Object.keys(categoryData).length === 0 ? (
              <p className="text-gray-500 text-center py-8">No data available</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(categoryData)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 8)
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 truncate flex-1">{category}</span>
                      <div className="flex items-center space-x-3 ml-4">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                            style={{ 
                              width: `${(count / Math.max(...Object.values(categoryData))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivities.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No activities yet</p>
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        by {activity.studentName} • {activity.category}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.createdAt?.toDate()).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {getStatusIcon(activity.status)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Faculty Derived Admin Status */}
        <div className="rounded-xl border glass-panel">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Faculty Derived Admin Status</h2>
            <p className="text-sm text-gray-600">View all faculty and manage derived admin badges</p>
          </div>
          <div className="divide-y divide-gray-200">
            {allUsers.filter(u => u.role === 'faculty' || u.role === 'derived-admin').length === 0 ? (
              <div className="p-8 text-center text-gray-500">No faculty found</div>
            ) : (
              allUsers
                .filter(u => u.role === 'faculty' || u.role === 'derived-admin')
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((u) => {
                  const pendingReq = requests.find(r => r.requesterUid === u.uid && r.status === 'pending');
                  return (
                    <div key={u.uid} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.name} ({u.email})</p>
                        <p className="text-xs text-gray-600">Role: {u.role}{pendingReq ? ' • Pending request' : ''}</p>
                      </div>
                      <div className="space-x-2">
                        {u.role === 'derived-admin' ? (
                          <button onClick={() => revokeDerived(u.uid)} className="px-3 py-1 rounded-md bg-red-600 text-white text-sm">Revoke Badge</button>
                        ) : pendingReq ? (
                          <>
                            <button onClick={() => approveDerived(pendingReq.id, u.uid)} className="px-3 py-1 rounded-md bg-green-600 text-white text-sm">Approve</button>
                            <button onClick={() => rejectDerived(pendingReq.id)} className="px-3 py-1 rounded-md bg-gray-600 text-white text-sm">Reject</button>
                            <button onClick={() => grantDerived(u.uid)} className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm">Grant Badge</button>
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-gray-500 mr-2">No request</span>
                            <button onClick={() => grantDerived(u.uid)} className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm">Grant Badge</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Student Complaints and Admin Remarks */}
        <div className="rounded-xl border glass-panel">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Student Complaints</h2>
            <p className="text-sm text-gray-600">Review bias complaints and add admin remarks</p>
          </div>
          <div className="divide-y divide-gray-200">
            {complaints.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No complaints</div>
            ) : (
              complaints
                .sort((a, b) => toJsDate(b.createdAt).getTime() - toJsDate(a.createdAt).getTime())
                .map((c) => (
                  <div key={c.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.studentName} ({c.studentEmail})</p>
                        <p className="text-xs text-gray-600">Faculty ID: {c.facultyId || 'N/A'} • Status: {c.status}</p>
                      </div>
                      <span className="text-xs text-gray-500">{c.createdAt && toJsDate(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-800">{c.message}</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={adminReplyMap[c.id] ?? c.adminRemarks ?? ''}
                        onChange={(e) => setAdminReplyMap(prev => ({ ...prev, [c.id]: e.target.value }))}
                        placeholder="Add admin remarks..."
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                      <button
                        onClick={() => updateComplaint(c.id, { adminRemarks: adminReplyMap[c.id] ?? '' })}
                        className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm"
                      >
                        Save
                      </button>
                      {c.status !== 'resolved' && (
                        <button
                          onClick={() => updateComplaint(c.id, { status: 'resolved', adminRemarks: adminReplyMap[c.id] ?? c.adminRemarks })}
                          className="px-3 py-2 rounded-md bg-green-600 text-white text-sm"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;