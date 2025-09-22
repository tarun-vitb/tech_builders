import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="h-16 w-16 object-cover" />
            ) : (
              <span className="text-white font-semibold text-xl">
                {user.name?.[0] || 'U'}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500 capitalize">Role: {user.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {user.role === 'student' && (
            <>
              {user.rollNo && (
                <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500">Roll No</p>
                  <p className="text-gray-800 font-medium">{user.rollNo}</p>
                </div>
              )}
              {user.branch && (
                <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500">Branch</p>
                  <p className="text-gray-800 font-medium">{user.branch}</p>
                </div>
              )}
            </>
          )}

          {user.role === 'faculty' && (
            <>
              {user.facultyId && (
                <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500">Faculty ID</p>
                  <p className="text-gray-800 font-medium">{user.facultyId}</p>
                </div>
              )}
              {user.branch && (
                <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500">Branch</p>
                  <p className="text-gray-800 font-medium">{user.branch}</p>
                </div>
              )}
            </>
          )}

          {user.role === 'admin' && (
            <>
              {user.accreditation && (
                <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500">Accreditation</p>
                  <p className="text-gray-800 font-medium uppercase">{user.accreditation}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;


