// src/components/Admin/AdminNavigation.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Home
} from 'lucide-react';

const AdminNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'Overview and key metrics'
    },
    {
      path: '/admin/content',
      icon: FileText,
      label: 'Content',
      description: 'Manage all content'
    },
    {
      path: '/admin/users',
      icon: Users,
      label: 'Users',
      description: 'User management'
    },
    {
      path: '/admin/analytics',
      icon: BarChart3,
      label: 'Analytics',
      description: 'Advanced analytics'
    }
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || (path === '/admin/dashboard' && location.pathname === '/admin');
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-8">
              <Home className="h-5 w-5 mr-2" />
              Back to Site
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  <div className="flex flex-col">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs text-gray-500">{item.description}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Admin Badge */}
          <div className="flex items-center">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              Admin Panel
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation;
