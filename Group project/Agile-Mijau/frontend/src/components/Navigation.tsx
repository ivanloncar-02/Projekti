import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { croatianTranslations } from '../translations/croatian';
import { NotificationBell } from './layout/NotificationBell';

export const Navigation: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (!isAuthenticated) {
      return [
        { path: '/login', label: croatianTranslations.navigation.login },
        { path: '/register', label: croatianTranslations.navigation.register },
      ];
    }

    const baseItems = [
      { path: '/dashboard', label: croatianTranslations.navigation.dashboard },
    ];

    if (user?.role === UserRole.STUDENT) {
      baseItems.push(
        { path: '/student/internships', label: croatianTranslations.navigation.internships },
        { path: '/student/applications', label: croatianTranslations.navigation.applications },
        { path: '/student/profile', label: croatianTranslations.navigation.profile }
      );
    } else if (user?.role === UserRole.EMPLOYER) {
      baseItems.push(
        { path: '/employer/internships', label: croatianTranslations.navigation.internships },
        { path: '/employer/profile', label: croatianTranslations.navigation.profile }
      );
    } else if (user?.role === UserRole.ADMIN) {
      baseItems.push(
        { path: '/admin/users', label: croatianTranslations.navigation.users },
        { path: '/admin/internships', label: croatianTranslations.navigation.internships },
        { path: '/admin/companies', label: croatianTranslations.navigation.companies }
      );
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                Agile Mijau
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:items-center">
              {navItems.map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link px-4 py-2 ${
                    index > 0 ? 'ml-8' : ''
                  } ${
                    location.pathname === item.path
                      ? 'nav-link-active'
                      : 'nav-link-inactive'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <NotificationBell />
                <button
                  onClick={handleLogout}
                  className="btn btn-danger cursor-pointer"
                >
                  {croatianTranslations.navigation.logout}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
