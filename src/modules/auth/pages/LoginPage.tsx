
import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bs-primary to-bs-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-lg mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-bs-primary to-bs-800" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Admin Paneline Hoş Geldiniz
          </h1>
          <p className="text-white/80 text-sm">
            Oxford 3000™ kelime listesini yönetin
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-bs-navy text-center">
                Giriş Yap
              </h2>
              <p className="mt-2 text-sm text-bs-navygri text-center">
                Henüz hesabınız yok mu?{' '}
                <Link
                  to="/auth/register"
                  className="font-medium text-bs-primary hover:text-bs-800"
                >
                  Hemen ücretsiz kayıt olun
                </Link>
              </p>
            </div>

            <LoginForm />

            <div className="text-center">
              <Link
                to="/auth/forgot-password"
                className="text-sm font-medium text-bs-primary hover:text-bs-800"
              >
                Şifrenizi mi unuttunuz?
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-white/80 hover:text-white">
            ← Ana sayfaya dön
          </Link>
        </div>
      </div>
    </div>
  );
};
