import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '../modules/auth/components';
import { AuthLayout } from '../modules/auth/components/AuthLayout';
import { DashboardLayout } from '../modules/dashboard/components/DashboardLayout';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { RegisterPage } from '../modules/auth/pages/RegisterPage';
import { LearnedWordsPage } from '../modules/dashboard/pages/LearnedWordsPage';
import { AchievementsPage } from '../modules/dashboard/pages/AchievementsPage';
import { ProgressPage } from '../modules/dashboard/pages/ProgressPage';
import { SettingsLayout } from '../modules/settings/components/SettingsLayout';
import { SettingsProfilePage } from '../modules/settings/pages/SettingsProfilePage';
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage';
import { ForgotPasswordPage } from '../modules/auth/pages/ForgotPasswordPage';
import { NewPasswordPage } from '../modules/auth/pages/NewPasswordPage';
import { AdminLayout } from '../modules/admin/components/AdminLayout';
import { AdminLoginPage } from '../modules/admin/pages/AdminLoginPage';
import { AdminDashboardPage } from '../modules/admin/pages/AdminDashboardPage';
import { AdminUsersPage } from '../modules/admin/pages/AdminUsersPage';
import { AdminWordsPage } from '../modules/admin/pages/AdminWordsPage';
import { AdminNotificationsPage } from '../modules/admin/pages/AdminNotificationsPage';
import App from '../App';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      
      {/* Auth Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="reset-password" element={<PublicRoute><NewPasswordPage /></PublicRoute>} />
      </Route>

      {/* Admin Auth Route */}
      <Route path="/admin/login" element={<PublicRoute><AdminLoginPage /></PublicRoute>} />

      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="words" element={<AdminWordsPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
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
        <Route index element={<DashboardPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="learned-words" element={<LearnedWordsPage />} />
        <Route path="settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to="profile" replace />} />
          <Route path="profile" element={<SettingsProfilePage />} />
        </Route>
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
