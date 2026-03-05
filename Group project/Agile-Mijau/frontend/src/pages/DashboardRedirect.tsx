import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export const DashboardRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case UserRole.STUDENT:
      return <Navigate to="/student/dashboard" replace />;
    case UserRole.EMPLOYER:
      return <Navigate to="/employer/dashboard" replace />;
    case UserRole.ADMIN:
      return <Navigate to="/admin/dashboard" replace />;
    case UserRole.COMPANY_MENTOR:
      return <Navigate to="/mentor/company/dashboard" replace />;
    case UserRole.ACADEMIC_MENTOR:
      return <Navigate to="/mentor/academic/dashboard" replace />;
    default:
      return <Navigate to="/student/dashboard" replace />;
  }
};
