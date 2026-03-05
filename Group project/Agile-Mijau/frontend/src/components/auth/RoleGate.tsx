import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface RoleGateProps {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleGate = ({ allowedRoles, children, fallback = null }: RoleGateProps) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};