import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './components/Auth/LoginScreen';
import CreateAccount from './components/Auth/CreateAccount';
import SignIn from './components/Auth/SignIn';
import Header from './components/Layout/Header';
import ProfilePage from './components/Profile/ProfilePage';
import StudentDashboard from './components/Student/StudentDashboard';
import FacultyDashboard from './components/Faculty/FacultyDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminRequests from './components/Admin/AdminRequests';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // When not authenticated, allow navigation between landing and create-account
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route 
            path="/" 
            element={
              user.role === 'student' ? (
                <StudentDashboard />
              ) : user.role === 'faculty' ? (
                <FacultyDashboard />
              ) : (user.role === 'admin' || user.role === 'derived-admin') ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route path="/profile" element={<ProfilePage />} />
          {(user.role === 'admin' || user.role === 'derived-admin') && (
            <Route path="/admin/requests" element={<AdminRequests />} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;