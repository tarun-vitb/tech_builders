import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const SignIn: React.FC = () => {
  const { signInExistingWithGoogle } = useAuth();

  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'admin' | 'derived-admin' | ''>('');
  const [rollNo, setRollNo] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState('');

  const handleSignIn = async () => {
    setError(null);
    try {
      if (selectedRole === '') return;
      if (selectedRole === 'admin') {
        if (adminKey.trim() !== 'vit69') {
          setError('Invalid admin key.');
          return;
        }
      }
      const identifier = selectedRole === 'student' ? rollNo : selectedRole === 'faculty' ? facultyId : adminKey || undefined;
      await signInExistingWithGoogle(selectedRole, identifier);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Sign in failed';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-8 text-center">Sign In</h1>

        <div className="mb-8">
          <div className="inline-flex rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
            {([
              { key: 'student', label: 'Student' },
              { key: 'faculty', label: 'Faculty' },
              { key: 'admin', label: 'Admin' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedRole(key)}
                className={`px-5 sm:px-6 py-3 text-base sm:text-lg font-semibold rounded-lg transition-colors ${
                  selectedRole === key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {selectedRole === '' && (
          <p className="text-gray-600 mb-6 text-center">Choose your role to continue.</p>
        )}

        {selectedRole === 'student' && (
          <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-xl p-6 shadow-sm w-full max-w-xl mx-auto">
            <div className="space-y-4">
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="Roll No"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                onClick={handleSignIn}
                className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2.5 shadow-sm hover:shadow-md transition-all"
              >
                Continue with Google
              </button>
              {error && <p className="text-red-600 text-sm">{error}</p>}
            </div>
          </div>
        )}

        {selectedRole === 'faculty' && (
          <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-xl p-6 shadow-sm w-full max-w-xl mx-auto">
            <div className="space-y-4">
              <input
                type="text"
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                placeholder="Faculty ID"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
              <button
                onClick={handleSignIn}
                className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-2.5 shadow-sm hover:shadow-md transition-all"
              >
                Continue with Google
              </button>
              {error && <p className="text-red-600 text-sm">{error}</p>}
            </div>
          </div>
        )}

        {selectedRole === 'admin' && (
          <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-xl p-6 shadow-sm w-full max-w-xl mx-auto">
            <div className="space-y-4">
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter Admin Key"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button
                onClick={handleSignIn}
                className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-2.5 shadow-sm hover:shadow-md transition-all"
              >
                Continue with Google
              </button>
              {error && <p className="text-red-600 text-sm">{error}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignIn;



