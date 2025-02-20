import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '../modules/auth/components';
import { AuthLayout } from '../modules/auth/components/AuthLayout';
import { DashboardLayout } from '../modules/dashboard/components/DashboardLayout';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { RegisterPage } from '../modules/auth/pages/RegisterPage';
import { LearnedWordsPage } from '../modules/dashboard/pages/LearnedWordsPage';
import { AchievementsPage } from '../modules/dashboard/pages/AchievementsPage';
import { ProgressPage } from '../modules/dashboard/pages/ProgressPage';
import { SettingsEmailPage } from '../modules/settings/pages/SettingsEmailPage';
import { SettingsPhonePage } from '../modules/settings/pages/SettingsPhonePage';
import { SettingsPasswordPage } from '../modules/settings/pages/SettingsPasswordPage';
import { SettingsNotificationsPage } from '../modules/settings/pages/SettingsNotificationsPage';
import { SettingsAppearancePage } from '../modules/settings/pages/SettingsAppearancePage';
import { SettingsPrivacyPage } from '../modules/settings/pages/SettingsPrivacyPage';
import { SettingsSecurityPage } from '../modules/settings/pages/SettingsSecurityPage';
import { SettingsLayout } from '../modules/settings/components/SettingsLayout';
import { SettingsProfilePage } from '../modules/settings/pages/SettingsProfilePage';
import DashboardPage from '../modules/admin/pages/DashboardPage';
import { ForgotPasswordPage } from '../modules/auth/pages/ForgotPasswordPage';
import { NewPasswordPage } from '../modules/auth/pages/NewPasswordPage';
import { AdminLoginPage } from '../modules/admin/pages/LoginPage';
import { AuthProvider, useAuth } from '../modules/admin/context/AuthContext';
import App from '../App';
import { AdminLayout } from '../modules/admin/components/AdminLayout';
import UsersPage from '../modules/admin/pages/UsersPage';
import UserDetailPage from '../modules/admin/pages/UserDetailPage';
import WordsPage from '../modules/admin/pages/WordsPage';
import WordFormPage from '../modules/admin/pages/WordFormPage';
import QuizzesPage from '../modules/admin/pages/QuizzesPage';
import QuizFormPage from '../modules/admin/pages/QuizFormPage';
import SettingsPage from '../modules/admin/pages/SettingsPage';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const AdminLoginWrapper = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  console.log('AdminLoginWrapper state:', { isAuthenticated, isAdmin, loading });

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated && isAdmin ? <Navigate to="/admin/dashboard" /> : <AdminLoginPage />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AuthProvider><AdminLayout /></AuthProvider>}>
        <Route path="login" element={<AdminLoginWrapper />} />
        <Route path="dashboard" element={
          <AdminRoute>
            <DashboardPage />
          </AdminRoute>
        } />
        <Route path="users" element={
          <AdminRoute>
            <UsersPage />
          </AdminRoute>
        } />
        <Route path="users/:id" element={
          <AdminRoute>
            <UserDetailPage />
          </AdminRoute>
        } />
        <Route path="words" element={
          <AdminRoute>
            <WordsPage />
          </AdminRoute>
        } />
        <Route path="words/:id" element={
          <AdminRoute>
            <WordFormPage />
          </AdminRoute>
        } />
        <Route path="quizzes" element={
          <AdminRoute>
            <QuizzesPage />
          </AdminRoute>
        } />
        <Route path="quizzes/:id" element={
          <AdminRoute>
            <QuizFormPage />
          </AdminRoute>
        } />
        <Route path="settings" element={
          <AdminRoute>
            <SettingsPage />
          </AdminRoute>
        } />
      </Route>

      {/* Auth Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="reset-password" element={<PublicRoute><NewPasswordPage /></PublicRoute>} />
      </Route>

      {/* Dashboard Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<LearnedWordsPage />} />
        <Route path="learned-words" element={<LearnedWordsPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="progress" element={<ProgressPage />} />

        {/* Settings Routes */}
        <Route path="settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to="profile" />} />
          <Route path="profile" element={<SettingsProfilePage />} />
          <Route path="email" element={<SettingsEmailPage />} />
          <Route path="phone" element={<SettingsPhonePage />} />
          <Route path="password" element={<SettingsPasswordPage />} />
          <Route path="notifications" element={<SettingsNotificationsPage />} />
          <Route path="appearance" element={<SettingsAppearancePage />} />
          <Route path="privacy" element={<SettingsPrivacyPage />} />
          <Route path="security" element={<SettingsSecurityPage />} />
        </Route>
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};