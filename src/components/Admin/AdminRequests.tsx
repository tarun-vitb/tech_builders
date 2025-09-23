import React, { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, query, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface DerivedAdminRequest {
  id: string;
  requesterUid: string;
  requesterName: string;
  requesterEmail: string;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DerivedAdminRequest[]>([]);

  useEffect(() => {
    const requestsQuery = query(collection(db, 'derivedAdminRequests'));
    const unsub = onSnapshot(requestsQuery, (snapshot) => {
      const reqs: DerivedAdminRequest[] = [];
      snapshot.forEach((d) => reqs.push({ id: d.id, ...(d.data() as Omit<DerivedAdminRequest, 'id'>) }));
      setRequests(reqs);
    });
    return unsub;
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-6 rounded-xl border glass-panel">
        <p className="text-gray-700">Access denied. Admins only.</p>
      </div>
    );
  }

  const approve = async (id: string, uid: string) => {
    await updateDoc(doc(db, 'users', uid), { role: 'derived-admin' });
    await updateDoc(doc(db, 'derivedAdminRequests', id), { status: 'approved' });
  };

  const reject = async (id: string) => {
    await updateDoc(doc(db, 'derivedAdminRequests', id), { status: 'rejected' });
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Derived Admin Requests</h1>
        <p className="text-gray-600">Approve or reject faculty badge requests</p>
      </div>

      <div className="rounded-xl border glass-panel">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pending & Recent</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No requests</div>
          ) : (
            requests
              .sort((a, b) => (a.status === 'pending' ? -1 : 1) - (b.status === 'pending' ? -1 : 1))
              .map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.requesterName} ({r.requesterEmail})</p>
                    <p className="text-xs text-gray-600">Status: {r.status}</p>
                  </div>
                  {r.status === 'pending' && (
                    <div className="space-x-2">
                      <button onClick={() => approve(r.id, r.requesterUid)} className="px-3 py-1 rounded-md bg-green-600 text-white text-sm">Approve</button>
                      <button onClick={() => reject(r.id)} className="px-3 py-1 rounded-md bg-red-600 text-white text-sm">Reject</button>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRequests;


