// src/components/Admin/AdminLayout.tsx
import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      // Auto-collapse on tablet and medium desktop screens
      if (window.innerWidth < 1536 && window.innerWidth >= 1024) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar 
        isCollapsed={sidebarCollapsed} 
        setIsCollapsed={setSidebarCollapsed} 
      />
      
      {/* Main Content */}
      <div className={`
        min-h-screen transition-all duration-300 
        ${!isMobile 
          ? (sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64') 
          : 'ml-0'
        }
      `}>
        <div className="flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
