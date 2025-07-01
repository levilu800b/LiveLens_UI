// src/components/Admin/AdminSidebar.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Home,
  Menu,
  X,
  ChevronLeft,
  Plus,
  Film,
  BookOpen,
  Palette,
  Eye,
  Radio,
  Video
} from 'lucide-react';

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
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

  const contentCreationItems = [
    {
      path: '/admin/add-story',
      icon: BookOpen,
      label: 'Add Story',
      description: 'Create new story content'
    },
    {
      path: '/admin/add-film',
      icon: Film,
      label: 'Add Film',
      description: 'Create new film content'
    },
    {
      path: '/admin/add-content',
      icon: Plus,
      label: 'Add Content',
      description: 'Create new general content'
    },
    {
      path: '/admin/add-podcast',
      icon: Radio,
      label: 'Add Podcast',
      description: 'Create new podcast content'
    },
    {
      path: '/admin/add-animation',
      icon: Palette,
      label: 'Add Animation',
      description: 'Create new animation content'
    },
    {
      path: '/admin/add-sneak-peek',
      icon: Eye,
      label: 'Add Sneak Peek',
      description: 'Create new sneak peek content'
    },
    {
      path: '/admin/add-live-video',
      icon: Video,
      label: 'Add Live Video',
      description: 'Create new live video content'
    }
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || (path === '/admin/dashboard' && location.pathname === '/admin');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50 bg-white rounded-lg shadow-lg">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2.5 sm:p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors touch-manipulation"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 bg-white shadow-xl border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        w-64 h-full
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 ${isCollapsed ? 'lg:justify-center' : ''}`}>
            {!isCollapsed && (
              <div className="flex items-center min-w-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <LayoutDashboard className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="ml-2 sm:ml-3 text-base sm:text-lg font-bold text-gray-900 truncate">_livelens Admin</span>
              </div>
            )}
            
            {/* Collapse button - only visible on desktop */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`hidden lg:block p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft className={`h-5 w-5 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 sm:px-3 py-3 sm:py-4 space-y-1 sm:space-y-2 overflow-y-auto">
            {/* Main Navigation */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`
                    group flex items-center px-2 sm:px-3 py-2.5 sm:py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }
                    ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
                    active:bg-gray-100 touch-manipulation min-h-[44px]
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className={`flex-shrink-0 h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'} ${isCollapsed ? '' : 'mr-2 sm:mr-3'}`} />
                  {!isCollapsed && (
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate text-sm sm:text-base">{item.label}</span>
                      <span className="text-xs text-gray-500 mt-0.5 truncate hidden sm:block">{item.description}</span>
                    </div>
                  )}
                </Link>
              );
            })}

            {/* Content Creation Section */}
            <div className="pt-3 sm:pt-4">
              {!isCollapsed && (
                <div className="px-2 sm:px-3 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Content Creation
                  </h3>
                </div>
              )}
              
              {contentCreationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`
                      group flex items-center px-2 sm:px-3 py-2 sm:py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-green-50 text-green-700 border-l-4 border-green-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                      ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
                      active:bg-gray-100 touch-manipulation min-h-[44px]
                    `}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon className={`flex-shrink-0 h-4 w-4 ${isActive ? 'text-green-600' : 'text-gray-400'} ${isCollapsed ? '' : 'mr-2 sm:mr-3'}`} />
                    {!isCollapsed && (
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="truncate text-xs sm:text-sm">{item.label}</span>
                        <span className="text-xs text-gray-500 mt-0.5 truncate hidden sm:block">{item.description}</span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-2 sm:p-3">
            {/* Back to Site */}
            <Link
              to="/"
              className={`
                group flex items-center px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200 mb-2
                ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
                active:bg-gray-100 touch-manipulation min-h-[44px]
              `}
              title={isCollapsed ? 'Back to Site' : ''}
            >
              <Home className={`flex-shrink-0 h-5 w-5 text-gray-500 ${isCollapsed ? '' : 'mr-2 sm:mr-3'}`} />
              {!isCollapsed && <span className="text-sm sm:text-base">Back to Site</span>}
            </Link>

            {/* Admin Badge */}
            {!isCollapsed && (
              <div className="px-2 sm:px-3 py-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Admin Panel
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
