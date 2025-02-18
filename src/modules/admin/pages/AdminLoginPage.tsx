
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../auth/context';
import { supabase } from '../../../lib/supabase';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setLoginError(null);

    try {
      console.log('1. Giriş denemesi başlatılıyor...');

      // 1. Önce normal giriş yap
      const auth = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('2. Giriş sonucu:', auth);

      if (auth.error) {
        throw auth.error;
      }

      const userId = auth.data.user?.id;
      
      if (!userId) {
        throw new Error('Kullanıcı bilgisi alınamadı');
      }

      console.log('3. Admin kontrolü yapılıyor...');

      // 2. Admin kontrolü
      const { data: isAdmin, error: adminError } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      console.log('4. Admin kontrolü sonucu:', { isAdmin, adminError });

      if (adminError || !isAdmin) {
        throw new Error('Bu alana erişim yetkiniz yok');
      }

      console.log('5. Yönlendirme yapılıyor...');

      // 3. Başarılı giriş, yönlendir
      navigate('/admin/dashboard');
      
    } catch (err: any) {
      console.error('Hata:', err);
      setLoginError(err.message);
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
            Koalang Yönetim Paneli
          </h1>
          <p className="text-white/80 text-sm">
            Koalang Yönetim Paneli
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

              {(loginError || authError) && (
                <div className="rounded-xl bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{loginError || authError}</p>
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
