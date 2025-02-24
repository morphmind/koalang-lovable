
import React from 'react';
import { User } from '../../auth/types';
import { BookOpen, Award, Activity, ArrowUpRight, LucideIcon } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { LoadingSpinner } from '../../auth/components/LoadingSpinner';
import { ErrorMessage } from '../../auth/components/ErrorMessage';
import { useLocation } from 'react-router-dom';

interface DashboardHeaderProps {
  user: User;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showLearned: boolean;
  setShowLearned: (show: boolean) => void;
  setShowQuiz: (show: boolean) => void;
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  subValue?: string;
  trend?: 'up' | 'down';
  iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  iconColor = "text-bs-primary"
}) => (
  <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-r from-bs-primary/5 to-bs-800/5 
                  rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
    <div className="relative p-6 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center 
                    bg-gradient-to-br from-bs-50 to-white ${iconColor} shadow-sm`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-sm font-medium text-bs-navygri mb-1">
          {label}
        </div>
        <div className="text-2xl font-bold text-bs-navy">
          {value}
        </div>
        {subValue && (
          <div className="text-sm text-bs-navygri mt-1">
            {subValue}
          </div>
        )}
      </div>
    </div>
  </div>
);

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  user, 
  searchQuery, 
  setSearchQuery, 
  showLearned, 
  setShowLearned,
  setShowQuiz 
}) => {
  const { stats: dashboardStats, isLoading, error } = useDashboard();
  const location = useLocation();
  const isMainDashboard = location.pathname === '/dashboard';

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-bs-100 p-6 md:p-8">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-bs-100 p-6 md:p-8">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-bs-100 overflow-hidden">
      {isMainDashboard && (
        <>
          {/* Modern Gradient Header */}
          <div className="relative bg-gradient-to-br from-bs-primary to-bs-800 p-8 pb-16">
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl 
                         -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl 
                         translate-y-1/2 -translate-x-1/2" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur
                              text-white/90 text-sm font-medium">
                  koa<span className="text-bs-400">:lang</span>
                </div>
              </div>

              <div className="max-w-2xl">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Merhaba, {user.username}! 👋
                </h1>
                <p className="text-lg text-white/80">
                  Bugün öğrenmeye devam edelim. İşte ilerleme durumunuz:
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section - Elevated Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 -mt-12 relative z-20">
            <StatCard
              icon={BookOpen}
              label="Öğrenilen Kelimeler"
              value={dashboardStats.learnedWords}
              subValue={`/ ${dashboardStats.totalWords} kelime`}
              iconColor="text-emerald-600"
            />

            <StatCard
              icon={Award}
              label="Başarı Oranı"
              value={dashboardStats.successRate}
              subValue="doğruluk oranı"
              iconColor="text-blue-600"
            />

            <StatCard
              icon={Activity}
              label="Günlük Seri"
              value={dashboardStats.streak}
              subValue="gün"
              iconColor="text-orange-600"
            />
          </div>
        </>
      )}
    </div>
  );
};
