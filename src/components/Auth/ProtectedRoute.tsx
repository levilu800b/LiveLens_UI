// src/components/Auth/ProtectedRoute.tsx
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

interface UserInfo {
  // Define the properties of userInfo here, for example:
  id: string;
  name: string;
  email: string;
  // Add other fields as needed
}

interface RootState {
  user: {
    userInfo: UserInfo | null;
  };
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { userInfo } = useSelector((state: RootState) => state.user);
  const location = useLocation();

  if (!userInfo) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;