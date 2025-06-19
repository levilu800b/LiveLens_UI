// src/components/Auth/ProtectedRoute.tsx - UPDATED VERSION
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import unifiedAuth from '../../utils/unifiedAuth';


interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { userInfo, isLoading } = useSelector((state: RootState) => state.user);
  const location = useLocation();

  // Show loading spinner while authentication is being restored
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

  if (!isLoading && !userInfo && !unifiedAuth.isLoggedIn()) {
  return <Navigate to="/login" state={{ from: location }} replace />;
}

  // Check authentication after loading is complete
  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;