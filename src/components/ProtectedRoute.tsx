import { Navigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';

type UserRole = 'admin' | 'director' | 'operator';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role as UserRole)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'director') return <Navigate to="/director" replace />;
    return <Navigate to="/operator/entry" replace />;
  }

  return <>{children}</>;
}
