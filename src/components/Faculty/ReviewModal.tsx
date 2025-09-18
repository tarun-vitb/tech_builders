import React, { useState } from 'react';
import { X, CheckCircle, XCircle, MessageSquare, AlertCircle } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Activity } from '../../types';
import FileViewer from '../FileViewer';

interface ReviewModalProps {
  activity: Activity;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ activity, onClose }) => {
  const { user } = useAuth();
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!action) return;
    
    if (action === 'reject' && !remarks.trim()) {
      setError('Please provide remarks for rejection');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await updateDoc(doc(db, 'activities', activity.id), {
        status: action === 'approve' ? 'approved' : 'rejected',
        remarks: remarks.trim() || null,
        reviewedAt: serverTimestamp(),
        reviewedBy: user?.name || 'Unknown'
      });

      onClose();
    } catch (error) {
      console.error('Error updating activity:', error);
      setError('Failed to update activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white/90 backdrop-blur-md shadow-xl rounded-2xl border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Review Activity</h2>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Details</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Title</label>
                    <p className="text-gray-900 mt-1">{activity.title}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Student</label>
                    <p className="text-gray-900 mt-1">{activity.studentName}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <span className="inline-block bg-gray-200 px-2 py-1 rounded-md text-sm text-gray-800 mt-1">
                      {activity.category}
                    </span>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900 mt-1">{activity.description}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Submitted</label>
                    <p className="text-gray-900 mt-1">
                      {new Date(activity.createdAt?.toDate()).toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">File</label>
                    <div className="mt-2">
                      {activity.fileId ? (
                        <span className="text-blue-600">{activity.fileName}</span>
                      ) : activity.fileUrl ? (
                        <a
                          href={activity.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 underline"
                        >
                          <span>{activity.fileName}</span>
                        </a>
                      ) : (
                        <span className="text-gray-400">No file</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* File Preview */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">File Preview</h4>
                {activity.fileId ? (
                  <FileViewer
                    fileId={activity.fileId}
                    fileName={activity.fileName}
                    fileType={activity.fileType}
                  />
                ) : activity.fileUrl ? (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    {activity.fileType === 'application/pdf' ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">PDF Preview</p>
                        <iframe
                          src={activity.fileUrl}
                          width="100%"
                          height="400"
                          className="border rounded"
                        />
                      </div>
                    ) : (
                      <div className="text-center">
                        <img
                          src={activity.fileUrl}
                          alt={activity.title}
                          className="max-w-full max-h-96 mx-auto rounded"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border rounded-lg p-8 bg-gray-50 text-center">
                    <p className="text-gray-500">No file available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Review Form */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Decision</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Action</label>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
                      <input
                        type="radio"
                        name="action"
                        value="approve"
                        checked={action === 'approve'}
                        onChange={() => setAction('approve')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <div className="ml-3 flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium text-gray-900">Approve</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-red-50 transition-colors">
                      <input
                        type="radio"
                        name="action"
                        value="reject"
                        checked={action === 'reject'}
                        onChange={() => setAction('reject')}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                      />
                      <div className="ml-3 flex items-center space-x-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-medium text-gray-900">Reject</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks {action === 'reject' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder={action === 'approve' ? 'Optional feedback for the student' : 'Please provide reasons for rejection'}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !action}
                    className={`px-6 py-3 text-white rounded-lg shadow-md hover:shadow-lg focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                      action === 'approve'
                        ? 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 focus:ring-green-500'
                        : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 focus:ring-red-500'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        {action === 'approve' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span>{action === 'approve' ? 'Approve' : 'Reject'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;