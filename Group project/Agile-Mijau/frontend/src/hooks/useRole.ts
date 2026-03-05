import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

/**
 * Custom hook for role-based access control
 *
 * @example
 * const { hasRole, isAdmin, isStudent } = useRole();
 * if (isAdmin) { ... }
 */
export const useRole = () => {
  const { user } = useAuth();

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const hasAllRoles = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.every(role => user.role === role);
  };

  return {
    userRole: user?.role,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAdmin: user?.role === UserRole.ADMIN,
    isStudent: user?.role === UserRole.STUDENT,
    isEmployer: user?.role === UserRole.EMPLOYER,
    isCompanyMentor: user?.role === UserRole.COMPANY_MENTOR,
    isAcademicMentor: user?.role === UserRole.ACADEMIC_MENTOR,
  };
};
