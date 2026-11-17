import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ForbiddenPage } from '../pages/public/ErrorPages';
import { FullPageLoader } from '../components/ui/States';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ children, allowedRoles, redirectTo }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!user) {
    const loginPath =
      redirectTo || (allowedRoles.includes('Admin') && !allowedRoles.includes('Patient')
        ? '/doctor-admin/login'
        : '/login');
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <ForbiddenPage />;
  }

  return <>{children}</>;
}
