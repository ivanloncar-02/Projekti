import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * RoleGate component that conditionally renders children based on user role
 *
 * @example
 * <RoleGate allowedRoles={['ADMIN']}>
 *   <AdminPanel />
 * </RoleGate>
 */
export const RoleGate: React.FC<RoleGateProps> = ({
  children,
  allowedRoles,
  fallback = null,
}) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, don't render anything
  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  // Check if user's role is in the allowed roles list
  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
