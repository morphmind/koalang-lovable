
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../auth/context';
import { supabase } from '../../../lib/supabase';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Kullanıcının admin olup olmadığını kontrol et
      const { data: isAdminResult, error: adminCheckError } = await supabase.rpc(
        'is_admin',
        { p_user_id: (await supabase.auth.getUser()).data.user?.id }
      );

      if (adminCheckError) throw adminCheckError;

      if (!isAdminResult) {
        throw new Error('Bu alana erişim yetkiniz yok.');
      }

      // Admin girişi başarılı, admin paneline yönlendir
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setLoginError(err.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bs-primary to-bs-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-lg mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-bs-primary to-bs-800" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Admin Paneli
          </h1>
          <p className="text-white/80 text-sm">
            Oxford 3000™ Yönetim Paneli
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-bs-navy text-center">
                Yönetici Girişi
              </h2>
              <p className="mt-2 text-sm text-bs-navygri text-center">
                Bu alan sadece yöneticiler içindir
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-bs-navy">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-bs-navygri" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 text-sm text-bs-navy placeholder-bs-navygri/50
                           bg-white border border-bs-100 rounded-xl shadow-sm
                           focus:ring focus:ring-bs-primary/10 focus:border-bs-primary"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-bs-navy">
                  Şifre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-bs-navygri" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3.5 text-sm text-bs-navy placeholder-bs-navygri/50
                           bg-white border border-bs-100 rounded-xl shadow-sm
                           focus:ring focus:ring-bs-primary/10 focus:border-bs-primary"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-bs-navygri hover:text-bs-navy transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-bs-navygri hover:text-bs-navy transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {(loginError || error) && (
                <div className="rounded-xl bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{loginError || error}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full relative flex items-center justify-center px-4 py-3.5 text-sm font-medium
                        text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 
                        focus:ring-bs-primary transition-all duration-200
                        ${isSubmitting 
                          ? 'bg-bs-primary/80 cursor-not-allowed'
                          : 'bg-gradient-to-r from-bs-primary to-bs-800 hover:from-bs-800 hover:to-bs-primary'
                        }`}
              >
                {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
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

