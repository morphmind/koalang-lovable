
import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuthForm } from '../hooks/useAuthForm';
import { LoadingSpinner } from './LoadingSpinner';
import { SocialButtons } from './SocialButtons';

export const LoginForm: React.FC = () => {
  const {
    errors,
    touched,
    isSubmitting,
    formError,
    handleSubmit,
    getFieldProps
  } = useAuthForm('login');

  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
            type="email"
            {...getFieldProps('email')}
            className={`block w-full pl-12 pr-4 py-3.5 text-sm text-bs-navy placeholder-bs-navygri/50
                     bg-white border rounded-xl shadow-sm transition-all duration-200
                     focus:ring focus:ring-bs-primary/10 focus:border-bs-primary
                     ${touched.email && errors.email 
                       ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' 
                       : 'border-bs-100'}`}
            placeholder="ornek@email.com"
          />
          {touched.email && errors.email && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
        {touched.email && errors.email && (
          <p className="text-sm text-red-600 pl-1" id="email-error">
            {errors.email}
          </p>
        )}
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
            type={showPassword ? 'text' : 'password'}
            {...getFieldProps('password')}
            className={`block w-full pl-12 pr-12 py-3.5 text-sm text-bs-navy placeholder-bs-navygri/50
                     bg-white border rounded-xl shadow-sm transition-all duration-200
                     focus:ring focus:ring-bs-primary/10 focus:border-bs-primary
                     ${touched.password && errors.password 
                       ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' 
                       : 'border-bs-100'}`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
            aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-bs-navygri hover:text-bs-navy transition-colors" />
            ) : (
              <Eye className="h-5 w-5 text-bs-navygri hover:text-bs-navy transition-colors" />
            )}
          </button>
        </div>
        {touched.password && errors.password && (
          <p className="text-sm text-red-600 pl-1" id="password-error">
            {errors.password}
          </p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-bs-primary border-bs-100 rounded focus:ring-bs-primary"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-bs-navygri">
            Beni hatırla
          </label>
        </div>
      </div>

      {/* Auth Error */}
      {formError && (
        <div className="rounded-xl bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full relative flex items-center justify-center px-4 py-3.5 text-sm font-medium
                  text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 
                  focus:ring-bs-primary transition-all duration-200 group
                  ${isSubmitting 
                    ? 'bg-bs-primary/80 cursor-not-allowed'
                    : 'bg-gradient-to-r from-bs-primary to-bs-800 hover:from-bs-800 hover:to-bs-primary'}`}
      >
        <span className="relative flex items-center gap-2">
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              Giriş yapılıyor...
            </>
          ) : (
            'Giriş Yap'
          )}
        </span>
      </button>

      {/* Social Login */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-bs-100" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-bs-navygri">
              Veya
            </span>
          </div>
        </div>

        <div className="mt-6">
          <SocialButtons />
        </div>
      </div>
    </form>
  );
};
