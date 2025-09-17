import React from 'react';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginScreen: React.FC = () => {
  const features = [
    {
      title: 'Upload Activities',
      description: 'Submit certificates, projects, and achievements for faculty review in minutes.'
    },
    {
      title: 'Track Submission Status',
      description: 'See live statuses for pending, approved, and rejected submissions at a glance.'
    },
    {
      title: 'Faculty Reviews',
      description: 'Receive structured feedback and remarks from faculty to improve your portfolio.'
    },
    {
      title: 'Generate PDF Portfolio',
      description: 'Export an elegant, ready-to-share PDF of your approved activities.'
    },
    {
      title: 'Admin Analytics',
      description: 'Admins can view platform-wide metrics to guide decisions and improvements.'
    },
    {
      title: 'Category Insights',
      description: 'Understand which activity categories are most active across the platform.'
    },
    {
      title: 'View Attachments',
      description: 'Open and verify submitted files directly from each submission.'
    },
    {
      title: 'Remarks & Feedback',
      description: 'Capture qualitative insights from faculty alongside formal approvals.'
    },
    {
      title: 'Real-time Updates',
      description: 'See new submissions and updates instantly with real-time synchronization.'
    },
    {
      title: 'Role-based Dashboards',
      description: 'Tailored experiences for students, faculty, and admins to stay productive.'
    }
  ];

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Top bar with login buttons */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-md">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Student Activity Hub
            </h1>
          </div>
        </div>

        <button
          type="button"
          className="text-sm sm:text-base px-4 py-2 rounded-lg border border-gray-200 bg-white/70 hover:bg-white text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          onClick={() => navigate('/create-account')}
        >
          Create Account
        </button>
      </div>

      {/* Hero Image */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl shadow-lg border border-white/30">
          <img
            src="/college-hero.jpg"
            alt="College campus"
            className="w-full h-64 sm:h-80 lg:h-[28rem] object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-8">
            <div className="bg-black/50 text-white text-sm sm:text-base lg:text-lg px-3 sm:px-4 py-2 sm:py-3 rounded-lg backdrop-blur">
              Showcase achievements, receive faculty feedback, and explore analytics-driven insights — all in one place.
            </div>
          </div>
        </div>
      </div>

      {/* Features as Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map(({ title, description }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-xl bg-white/90 backdrop-blur-md border border-gray-100 p-5 sm:p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              <h3 className="font-semibold text-blue-700 group-hover:text-purple-700 transition-colors mb-2">{title}</h3>
              <p className="text-sm text-gray-700 group-hover:text-gray-800 leading-relaxed">{description}</p>
              <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-200 bg-gradient-to-br from-blue-100 to-purple-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;