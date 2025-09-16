import React, { useState } from 'react';
import { BookOpen, LogIn, Users, Award, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Student Activity Hub
              </h1>
              <p className="text-gray-600 mt-1">Centralized Achievement Platform</p>
            </div>
          </div>

          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            A unified platform where students showcase their achievements, faculty provides valuable feedback, 
            and administrators gain insights through comprehensive analytics.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
              <div className="p-3 bg-green-100 rounded-xl w-fit mx-auto mb-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Students</h3>
              <p className="text-sm text-gray-600">Upload & showcase achievements</p>
            </div>
            
            <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
              <div className="p-3 bg-blue-100 rounded-xl w-fit mx-auto mb-3">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Faculty</h3>
              <p className="text-sm text-gray-600">Review & provide feedback</p>
            </div>
            
            <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-sm">
              <div className="p-3 bg-purple-100 rounded-xl w-fit mx-auto mb-3">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Admins</h3>
              <p className="text-sm text-gray-600">Analytics & insights</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to access your dashboard</p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
            </button>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our terms of service and privacy policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;