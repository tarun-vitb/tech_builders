import React, { useState, useEffect } from 'react';
import { Plus, FileText, Clock, CheckCircle, XCircle, Download, Upload } from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Activity } from '../../types';
import UploadActivityModal from './UploadActivityModal';
import { generatePDFPortfolio } from '../../utils/pdfGenerator';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [latestAlert, setLatestAlert] = useState<{ id: string; message: string; createdAt?: { toDate?: () => Date } | Date } | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [complaintText, setComplaintText] = useState('');
  const [complaintFacultyId, setComplaintFacultyId] = useState('');
  const [complaintSending, setComplaintSending] = useState(false);
  const [complaintMessage, setComplaintMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // First get all activities for the student, then sort in memory to avoid index requirement
    const q = query(
      collection(db, 'activities'),
      where('studentId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesData: Activity[] = [];
      snapshot.forEach((doc) => {
        activitiesData.push({ id: doc.id, ...doc.data() } as Activity);
      });
      // Sort by createdAt in descending order in memory
      activitiesData.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
      setActivities(activitiesData);
    });

    return unsubscribe;
  }, [user]);

  // Listen for latest broadcast alert
  useEffect(() => {
    const alertsQ = query(collection(db, 'alerts'));
    const unsub = onSnapshot(alertsQ, (snapshot) => {
      let recent: { id: string; message: string; createdAt?: { toDate?: () => Date } | Date } | null = null;
      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...(doc.data() as any) };
        if (!recent) {
          recent = data;
          return;
        }
        const a = (data.createdAt as any)?.toDate?.() || new Date(0);
        const b = (recent.createdAt as any)?.toDate?.() || new Date(0);
        if (a.getTime() > b.getTime()) recent = data;
      });
      setLatestAlert(recent);
    });
    return unsub;
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
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

  const handleGeneratePDF = async () => {
    if (!user) return;

    const approvedActivities = activities.filter(activity => activity.status === 'approved');
    if (approvedActivities.length === 0) {
      alert('No approved activities to generate portfolio');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      await generatePDFPortfolio(user, approvedActivities);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating portfolio. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const stats = {
    total: activities.length,
    pending: activities.filter(a => a.status === 'pending').length,
    approved: activities.filter(a => a.status === 'approved').length,
    rejected: activities.filter(a => a.status === 'rejected').length,
  };

  const submitComplaint = async () => {
    if (!user) return;
    if (!complaintText.trim()) {
      setComplaintMessage('Please enter a complaint before submitting.');
      return;
    }
    try {
      setComplaintSending(true);
      setComplaintMessage(null);
      await addDoc(collection(db, 'complaints'), {
        studentUid: user.uid,
        studentName: user.name,
        studentEmail: user.email,
        facultyId: complaintFacultyId.trim() || null,
        message: complaintText.trim(),
        status: 'open',
        createdAt: serverTimestamp(),
      });
      setComplaintText('');
      setComplaintFacultyId('');
      setComplaintMessage('Complaint submitted to admin successfully.');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to submit complaint.';
      setComplaintMessage(message);
    } finally {
      setComplaintSending(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {latestAlert && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-md">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Important Announcement</p>
              <p className="text-sm text-red-700 mt-1 whitespace-pre-wrap">{latestAlert.message}</p>
              <p className="text-xs text-red-500 mt-2">
                {(latestAlert.createdAt as any)?.toDate?.() ? new Date((latestAlert.createdAt as any).toDate()).toLocaleString() : ''}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Activities</h1>
          <p className="text-gray-600">Track your achievements and portfolio</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGeneratePDF}
            disabled={isGeneratingPDF || stats.approved === 0}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isGeneratingPDF ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>Portfolio PDF</span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Activity</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl p-6 glass-panel">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 glass-panel">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 glass-panel">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="rounded-xl border glass-panel">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
        </div>
        
        {activities.length === 0 ? (
          <div className="p-12 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
            <p className="text-gray-600 mb-6">Start by uploading your first achievement or activity</p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg gradient-button"
            >
              <Plus className="h-4 w-4" />
              <span>Add Your First Activity</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-white/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2">{activity.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span className="bg-gray-100 px-2 py-1 rounded-md">{activity.category}</span>
                      <span>{new Date(activity.createdAt?.toDate()).toLocaleDateString()}</span>
                      {activity.fileId ? (
                        <span className="text-blue-600">File attached</span>
                      ) : activity.fileUrl ? (
                        <a 
                          href={activity.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View File
                        </a>
                      ) : (
                        <span className="text-gray-400">No file</span>
                      )}
                    </div>

                    {activity.remarks && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-3">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Remarks: </span>
                          {activity.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    {getStatusIcon(activity.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadActivityModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* Complaint Box */}
      <div className="rounded-xl border glass-panel mt-6">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Report Faculty Bias (Private to Admin)</h2>
          <p className="text-sm text-gray-600">This message will be sent to the admin team.</p>
        </div>
        <div className="p-6 space-y-3">
          <input
            type="text"
            value={complaintFacultyId}
            onChange={(e) => setComplaintFacultyId(e.target.value)}
            placeholder="Faculty ID (optional)"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
          <textarea
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            placeholder="Describe the issue you faced..."
            rows={4}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
          <div className="flex items-center justify-between">
            {complaintMessage && <p className="text-sm text-gray-600">{complaintMessage}</p>}
            <button
              onClick={submitComplaint}
              disabled={complaintSending}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg gradient-button disabled:opacity-50"
            >
              {complaintSending ? 'Sending...' : 'Submit Complaint'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;