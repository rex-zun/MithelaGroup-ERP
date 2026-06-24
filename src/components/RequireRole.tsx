import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { canAccessRoute } from '@/lib/roleAccess';

interface RequireRoleProps {
  children: React.ReactNode;
}

export default function RequireRole({ children }: RequireRoleProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300">
        Checking access...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccessRoute(user.role, location.pathname)) {
    return <Navigate to={user.role === 'director' ? '/director-dashboard' : user.role === 'operator' ? '/entry-module' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}
