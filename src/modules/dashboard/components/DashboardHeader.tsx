
import React from 'react';
import { User } from '../../auth/types';
import { BookOpen, Award, Activity, Star } from 'lucide-react';
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
  icon: React.FC<any>;
  label: string;
  value: number;
  subValue?: string;
  iconColor?: string;
  bgColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  label, 
  value, 
  subValue,
  iconColor = "text-bs-primary",
  bgColor = "bg-white/10"
}) => (
  <div className="relative flex items-start gap-3 rounded-xl bg-white/10 backdrop-blur-sm p-4
                border border-white/20 hover:border-white/30 transition-all group">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor} ${iconColor}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <div className="text-sm font-medium text-white/70 mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {subValue && (
        <div className="text-sm text-white/60 mt-1">{subValue}</div>
      )}
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

  const renderWordLevel = (percentage: number) => {
    if (percentage >= 80) return 'Uzman';
    if (percentage >= 60) return 'İleri Seviye';
    if (percentage >= 40) return 'Orta Seviye';
    if (percentage >= 20) return 'Başlangıç';
    return 'Yeni Başlayan';
  };

  const calculateProgress = () => {
    const totalWords = dashboardStats.totalWords;
    const learnedWords = dashboardStats.learnedWords;
    return Math.round((learnedWords / totalWords) * 100);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-bs-100 p-6">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-bs-100 p-6">
        <ErrorMessage message={error} />
      </div>
    );
  }

  const progressPercentage = calculateProgress();
  const userLevel = renderWordLevel(progressPercentage);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-bs-primary to-bs-800 rounded-2xl shadow-lg overflow-hidden">
        {isMainDashboard && (
          <div className="relative p-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl 
                         -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl 
                         translate-y-1/2 -translate-x-1/2" />
            
            {/* Main Content */}
            <div className="relative z-10">
              <div className="flex items-end justify-between mb-8">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur
                                text-white/90 text-sm font-medium">
                      koa<span className="text-bs-400">:lang</span>
                    </div>
                  </div>

                  <h1 className="text-4xl font-bold text-white mb-2">
                    Merhaba, {user.username}! 👋
                  </h1>
                  <p className="text-lg text-white/80">
                    Bugün öğrenmeye devam edelim. İşte ilerleme durumunuz:
                  </p>
                </div>

                {/* User Level Badge */}
                <div className="flex flex-col items-end">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-medium">{userLevel}</span>
                    </div>
                    <div className="text-sm text-white/60">Kelime Seviyesi</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-white/80">
                    Toplam İlerleme
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {progressPercentage}%
                  </span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <StatCard
                  icon={BookOpen}
                  label="Öğrenilen Kelimeler"
                  value={dashboardStats.learnedWords}
                  subValue={`/ ${dashboardStats.totalWords} kelime`}
                  iconColor="text-emerald-400"
                  bgColor="bg-emerald-500/10"
                />

                <StatCard
                  icon={Award}
                  label="Başarı Oranı"
                  value={dashboardStats.successRate}
                  subValue="doğruluk oranı"
                  iconColor="text-blue-400"
                  bgColor="bg-blue-500/10"
                />

                <StatCard
                  icon={Activity}
                  label="Günlük Seri"
                  value={dashboardStats.streak}
                  subValue="gün"
                  iconColor="text-orange-400"
                  bgColor="bg-orange-500/10"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
