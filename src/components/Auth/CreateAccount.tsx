import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const branches = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Aerospace Engineering',
  'Biotechnology',
  'Metallurgical Engineering',
  'Automobile Engineering',
  'Industrial Engineering',
  'Instrumentation Engineering',
];

const CreateAccount: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  // Student form state
  const [studentName, setStudentName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [studentBranch, setStudentBranch] = useState('');

  // Faculty form state
  const [facultyName, setFacultyName] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [facultyBranch, setFacultyBranch] = useState('');

  // Admin form state
  const [adminName, setAdminName] = useState('');
  const [accreditation, setAccreditation] = useState<'nba' | 'naac' | ''>('');

  // Role selection
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'admin' | ''>('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-8 text-center">Create Account</h1>

        {/* Role selector */}
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

        {/* Conditional forms */}
        {selectedRole === '' && (
          <p className="text-gray-600 mb-6 text-center">Please choose whether you are a Student, Faculty, or Admin to continue.</p>
        )}

        {selectedRole === 'student' && (
          <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-xl p-6 shadow-sm w-full max-w-xl mx-auto">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Student</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Name"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="Roll No"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <select
                value={studentBranch}
                onChange={(e) => setStudentBranch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="" disabled>
                  Select Branch
                </option>
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <button
                onClick={() =>
                  signInWithGoogle('student', {
                    rollNo,
                    branch: studentBranch,
                  }).catch(() => {})
                }
                className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2.5 shadow-sm hover:shadow-md transition-all"
              >
                Login as Student (Google)
              </button>
            </div>
          </div>
        )}

        {selectedRole === 'faculty' && (
          <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-xl p-6 shadow-sm w-full max-w-xl mx-auto">
            <h2 className="text-xl font-semibold text-purple-700 mb-4">Faculty</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                placeholder="Name"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
              <input
                type="text"
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                placeholder="Faculty ID"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
              <select
                value={facultyBranch}
                onChange={(e) => setFacultyBranch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="" disabled>
                  Select Branch
                </option>
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <button
                onClick={() =>
                  signInWithGoogle('faculty', {
                    facultyId,
                    branch: facultyBranch,
                  }).catch(() => {})
                }
                className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-2.5 shadow-sm hover:shadow-md transition-all"
              >
                Login as Faculty (Google)
              </button>
            </div>
          </div>
        )}

        {selectedRole === 'admin' && (
          <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-xl p-6 shadow-sm w-full max-w-xl mx-auto">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">Admin</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Name"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <select
                value={accreditation}
                onChange={(e) => setAccreditation(e.target.value as 'nba' | 'naac')}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="" disabled>
                  Select Accreditation
                </option>
                <option value="nba">NBA</option>
                <option value="naac">NAAC</option>
              </select>

              <button
                onClick={() =>
                  signInWithGoogle('admin', {
                    accreditation: accreditation || undefined,
                  }).catch(() => {})
                }
                className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-2.5 shadow-sm hover:shadow-md transition-all"
              >
                Login as Admin (Google)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateAccount;

