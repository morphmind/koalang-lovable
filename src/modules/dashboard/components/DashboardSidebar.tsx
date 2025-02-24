
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Award, Activity, Settings, ChevronRight, Zap, Brain, Target, Trophy, PenTool } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { useAuth } from '../../auth/context/AuthContext';
import { useWords } from '../../words/context/WordContext';
import { useAuthPopup } from '../../auth/hooks/useAuthPopup';
import { useVideoCall } from '../../video-call/context/VideoCallContext';
import { HeadphonesIcon, MessageSquare } from 'lucide-react';

export const DashboardSidebar: React.FC = () => {
  const { user } = useAuth();
  const { stats } = useDashboard();
  const { getLearnedWordsCount } = useWords();
  const { openAuthPopup } = useAuthPopup(); 
  const { startCall } = useVideoCall();
  const location = useLocation();

  const handleQuizClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default navigation
    if (!user) {
      openAuthPopup();
      return;
    }
    const event = new CustomEvent('showQuiz', { detail: { show: true } });
    window.dispatchEvent(event);
  };

  const handlePracticeClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default navigation
    if (!user) {
      openAuthPopup();
      return;
    }
    startCall();
  };

  const badges = React.useMemo(() => {
    if (!user) return [];
    
    const learnedCount = getLearnedWordsCount();
    const quizSuccessRate = stats.successRate || 0;
    const streak = stats.streak || 0;

    return [
      {
        id: 'beginner',
        icon: BookOpen,
        title: 'Başlangıç',
        color: 'bg-green-500',
        earned: learnedCount >= 10,
        description: '10+ kelime öğrenildi'
      },
      {
        id: 'intermediate',
        icon: Brain,
        title: 'Orta Seviye',
        color: 'bg-blue-500',
        earned: learnedCount >= 50,
        description: '50+ kelime öğrenildi'
      },
      {
        id: 'advanced',
        icon: Award,
        title: 'İleri Seviye',
        color: 'bg-purple-500',
        earned: learnedCount >= 100,
        description: '100+ kelime öğrenildi'
      },
      {
        id: 'master',
        icon: Trophy,
        title: 'Kelime Ustası',
        color: 'bg-amber-500',
        earned: learnedCount >= 500,
        description: '500+ kelime öğrenildi'
      },
      {
        id: 'quiz_master',
        icon: Target,
        title: 'Sınav Ustası',
        color: 'bg-indigo-500',
        earned: quizSuccessRate >= 90,
        description: '%90+ başarı oranı'
      },
      {
        id: 'streak_master',
        icon: Zap,
        title: 'Seri Ustası',
        color: 'bg-pink-500',
        earned: streak >= 30,
        description: '30+ gün seri'
      }
    ];
  }, [user, getLearnedWordsCount, stats]);

  const earnedBadges = badges.filter(badge => badge.earned);

  const menuItems = [
    {
      icon: BookOpen,
      label: 'Ana Sayfa',
      href: '/dashboard',
      description: 'Kelime öğrenmeye devam et'
    },
    {
      icon: BookOpen,
      label: 'Öğrendiğim Kelimeler',
      href: '/dashboard/learned-words',
      description: 'Öğrendiğin kelimeleri gör'
    },
    {
      icon: Activity,
      label: 'İlerlemem',
      href: '/dashboard/progress',
      description: 'İlerleme durumunu gör'
    },
    {
      icon: Award,
      label: 'Başarılarım',
      href: '/dashboard/achievements',
      description: 'Kazandığın başarılar'
    },
    {
      icon: Settings,
      label: 'Ayarlar',
      href: '/dashboard/settings',
      description: 'Hesap ayarlarını yönet'
    }
  ];

  return (
    <aside className="lg:col-span-3 lg:sticky lg:top-8 space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-bs-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-bs-primary to-bs-800 p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 ring-2 ring-white/20 backdrop-blur-sm
                           shadow-lg relative z-10 flex items-center justify-center">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.username}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="text-2xl font-bold text-white">
                    {user?.username?.[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h2 className="text-xl font-semibold text-white truncate">
                {user?.username}
              </h2>
              <p className="text-sm text-white/70">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        {earnedBadges.length > 0 && (
          <div className="px-6 py-4 border-t border-bs-100 bg-gradient-to-b from-bs-50/50">
            <h3 className="text-sm font-medium text-bs-navy mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-bs-primary" />
              Kazanılan Rozetler
            </h3>
            <div className="flex flex-wrap gap-2">
              {earnedBadges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <div 
                    key={badge.id}
                    className="group relative"
                  >
                    <div className={`w-10 h-10 rounded-xl ${badge.color} flex items-center justify-center
                                 shadow-lg transition-all duration-300 cursor-pointer
                                 hover:scale-110 hover:-translate-y-1 hover:shadow-xl`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    
                    <div className={`absolute bottom-full mb-2 opacity-0 group-hover:opacity-100
                                transition-all duration-200 pointer-events-none z-50 min-w-[140px]
                                ${index === 0 ? 'left-0' : 'left-1/2 -translate-x-1/2'}
                                transform -translate-y-2 group-hover:translate-y-0`}>
                      <div className="bg-white rounded-lg shadow-xl p-2 text-center border border-bs-100">
                        <div className="font-medium text-bs-navy text-sm">{badge.title}</div>
                        <div className="text-xs text-bs-navygri">{badge.description}</div>
                      </div>
                      <div className={`absolute -bottom-1 ${index === 0 ? 'left-4' : 'left-1/2 -translate-x-1/2'} 
                                  w-2 h-2 bg-white transform rotate-45 border-r border-b border-bs-100`}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="p-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    preventScrollReset={true}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all relative group cursor-pointer
                              ${isActive 
                                ? 'bg-gradient-to-r from-bs-primary to-bs-800 text-white shadow-lg shadow-bs-primary/20' 
                                : 'text-bs-navy hover:bg-bs-50 hover:-translate-y-0.5 hover:shadow-md'}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all
                                  ${isActive 
                                    ? 'bg-white/10 text-white group-hover:bg-white/20' 
                                    : 'bg-bs-50 text-bs-navygri group-hover:text-bs-primary group-hover:scale-110'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium mb-0.5 ${isActive ? 'text-white' : ''}`}>
                        {item.label}
                      </div>
                      <div className={`text-xs truncate ${isActive 
                        ? 'text-white/80' 
                        : 'text-bs-navygri group-hover:text-bs-navy'}`}>
                        {item.description}
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform ${isActive 
                      ? 'text-white/80' 
                      : 'text-bs-navygri group-hover:text-bs-navy'} group-hover:translate-x-1`} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Koaly Chat Button */}
      <div className="hidden lg:block">
        <button
          onClick={handlePracticeClick}
          className="group relative w-full flex items-center gap-4 p-4 rounded-2xl 
                   bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600
                   hover:shadow-xl transition-all duration-300
                   hover:-translate-y-1 overflow-hidden"
        >
          <div className="relative z-10 flex items-start gap-4 w-full">
            <div className="flex-shrink-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 ring-2 ring-white/20 backdrop-blur-sm
                             transition-transform duration-300 group-hover:scale-110">
                  <img src="/koaly-avatar.svg" alt="Koaly" className="w-full h-full" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full 
                             ring-2 ring-white animate-pulse"></div>
              </div>
            </div>

            <div className="flex-1 min-w-0 text-left">
              <span className="text-lg font-semibold text-white block mb-1">Koaly ile Konuş</span>
              <p className="text-sm text-blue-100 mb-2">Hemen İngilizce pratik yap!</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full">
                  <HeadphonesIcon size={12} className="text-white/90" />
                  <span className="text-xs text-white/90 whitespace-nowrap">Sesli</span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full">
                  <MessageSquare size={12} className="text-white/90" />
                  <span className="text-xs text-white/90 whitespace-nowrap">Mesaj</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                       translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-400 rounded-2xl blur opacity-30 
                       group-hover:opacity-50 transition duration-300 animate-pulse"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-400 blur opacity-20 
                       group-hover:opacity-40 transition duration-300 animate-pulse delay-150"></div>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-bs-100 overflow-hidden">
        <div className="p-4 border-b border-bs-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-bs-50 flex items-center justify-center">
              <Zap className="w-4 h-4 text-bs-primary" />
            </div>
            <h3 className="text-sm font-semibold text-bs-navy">
              Hızlı Aksiyonlar
            </h3>
          </div>
        </div>
        
        <div className="divide-y divide-bs-100">
          <div
            role="button"
            tabIndex={0}
            onClick={handleQuizClick}
            onKeyPress={(e) => e.key === 'Enter' && handleQuizClick(e as any)}
            className="w-full flex items-center gap-3 p-4 hover:bg-bs-50 transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-bs-50 flex items-center justify-center
                         group-hover:bg-white transition-colors">
              <PenTool className="w-4 h-4 text-bs-primary" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="font-medium text-sm text-bs-navy">Sınav Ol</div>
              <div className="text-xs text-bs-navygri truncate">
                Öğrendiklerini test et
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-bs-navygri group-hover:text-bs-primary 
                                  group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </aside>
  );
};
