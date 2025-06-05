// src/components/Auth/AdminRoute.tsx
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

interface RootState {
  user: {
    userInfo: {
      isAdmin?: boolean;
    } | null;
  };
}

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { userInfo } = useSelector((state: RootState) => state.user);
  const location = useLocation();

  if (!userInfo) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!userInfo.isAdmin) {
    // Redirect to home page if not admin
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;