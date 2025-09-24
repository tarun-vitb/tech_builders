import React from 'react';
import { 
  Settings,
  MessageSquare,
  UserCheck,
  PieChart,
  Activity,
  Home,
  Users
} from 'lucide-react';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeSection, onSectionChange }) => {
  const navigationItems = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: Home,
      description: 'Main dashboard with key metrics'
    },
    {
      id: 'category-distribution',
      label: 'Category Distribution',
      icon: PieChart,
      description: 'Activity distribution by categories'
    },
    {
      id: 'derived-admin-requests',
      label: 'Derived Admin Requests',
      icon: UserCheck,
      description: 'Faculty admin privilege requests'
    },
    {
      id: 'faculty-status',
      label: 'Faculty Admin Status',
      icon: Users,
      description: 'Revoke and grant admin badges'
    },
    {
      id: 'recent-activities',
      label: 'Recent Activities',
      icon: Activity,
      description: 'Latest student submissions'
    },
    {
      id: 'student-complaints',
      label: 'Student Complaints',
      icon: MessageSquare,
      description: 'Review bias complaints'
    }
  ];

  return (
    <div className="w-64 bg-white/80 backdrop-blur-md border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
        <p className="text-sm text-gray-600">Navigate dashboard sections</p>
      </div>
      
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
                    {item.label}
                  </p>
                  <p className={`text-xs truncate ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                    {item.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200 mt-auto">
        <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Settings className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Admin Tools</span>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            Manage platform settings and configurations
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
