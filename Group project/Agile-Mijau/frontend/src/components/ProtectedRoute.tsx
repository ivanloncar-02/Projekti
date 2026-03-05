import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { toast } from 'sonner';

// Helper function to get dashboard route based on user role
const getDashboardRoute = (role: UserRole): string => {
  switch (role) {
    case UserRole.STUDENT:
      return '/student/dashboard';
    case UserRole.EMPLOYER:
      return '/employer/dashboard';
    case UserRole.ADMIN:
      return '/admin/dashboard';
    case UserRole.COMPANY_MENTOR:
      return '/mentor/company/dashboard';
    case UserRole.ACADEMIC_MENTOR:
      return '/mentor/academic/dashboard';
    default:
      return '/';
  }
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Determine which roles are allowed
  const rolesArray = allowedRoles || (requiredRole ? [requiredRole] : []);
  const hasAccess = user && rolesArray.length > 0 ? rolesArray.includes(user.role) : true;

  // Show toast when user doesn't have permission
  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasAccess) {
      toast.error('Nemate dozvolu za pristup ovoj stranici', {
        description: 'Preusmjereni ste na vašu glavnu stranicu.',
      });
    }
  }, [isLoading, isAuthenticated, hasAccess]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Učitavanje...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!hasAccess) {
    // Redirect to user's appropriate dashboard instead of generic unauthorized page
    const dashboardRoute = user ? getDashboardRoute(user.role) : '/';
    return <Navigate to={dashboardRoute} replace />;
  }

  return <>{children}</>;
};
