
import React, { useEffect, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthPopup } from '../hooks/useAuthPopup';
import { LoadingScreen } from '../../../components/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const { openAuthPopup } = useAuthPopup();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('🔴 Kullanıcı girişi yok, auth popup açılıyor...', { pathname: location.pathname });
      openAuthPopup();
    } else if (user) {
      console.log('🟢 Kullanıcı girişi var:', {
        username: user.username,
        email: user.email,
        pathname: location.pathname
      });
    }
  }, [user, isLoading, openAuthPopup, location]);

  if (isLoading) {
    return <LoadingScreen message="Oturumunuz kontrol ediliyor..." />;
  }

  if (!user) {
    console.log('🔴 Kullanıcı girişi yok, Login\'e yönlendiriliyor...');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('🟢 Kullanıcı girişi var, içerik gösteriliyor...');
  return <>{children}</>;
};
