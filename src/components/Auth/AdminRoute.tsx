// src/components/Auth/AdminRoute.tsx - REPLACE YOUR CURRENT VERSION
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { userInfo, isLoading } = useSelector((state: RootState) => state.user);
  
  // 🆕 CRITICAL: Show loading while authentication is being restored
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Only check authentication AFTER loading is complete
  if (!userInfo) {
    return <Navigate to="/admin" replace />;
  }

  // Check admin status
  if (!userInfo.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;