
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../../../components/LoadingScreen';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/dashboard'
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || redirectTo;

  if (isLoading) {
    return <LoadingScreen message="Oturumunuz kontrol ediliyor..." />;
  }

  if (user) {
    console.log('🟢 Kullanıcı giriş yapmış, yönlendiriliyor...', { to: from });
    return <Navigate to={from} replace />;
  }

  console.log('🟡 Public route render ediliyor...');
  return <>{children}</>;
};
