// src/components/Admin/AdminNavigation.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Home,
  Menu,
  X
} from 'lucide-react';

const AdminNavigation: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      label: 'Content Management',
      description: 'Manage all content with bulk actions'
    },
    {
      path: '/admin/users',
      icon: Users,
      label: 'User Management',
      description: 'User management and permissions'
    },
    {
      path: '/admin/analytics',
      icon: BarChart3,
      label: 'Analytics',
      description: 'Advanced analytics with export'
    }
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || (path === '/admin/dashboard' && location.pathname === '/admin');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 mb-4 sm:mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-between py-4">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-8">
              <Home className="h-5 w-5 mr-2" />
              <span className="hidden xl:inline">Back to Site</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-6 xl:space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 xl:px-4 py-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm xl:text-base">{item.label}</span>
                    <span className="text-xs text-gray-500 hidden xl:block">{item.description}</span>
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

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between py-3">
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <Home className="h-5 w-5 mr-2" />
              <span className="text-sm">Back to Site</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                Admin
              </span>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="pb-4 border-t border-gray-200 mt-2">
              <nav className="space-y-2 pt-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <div className="flex flex-col">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-gray-500 mt-1">{item.description}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation;
