// src/components/Auth/AdminRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { userInfo } = useSelector((state: RootState) => state.user) as { userInfo: { isAdmin: boolean } | null };
  const isAuthenticated = !!userInfo;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!userInfo?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;