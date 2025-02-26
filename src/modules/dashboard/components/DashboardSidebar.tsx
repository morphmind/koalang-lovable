import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, Award, Activity, Settings, ChevronRight, Zap, Brain, 
  Target, Trophy, PenTool, Home, Book, ChevronLeft,
  HeadphonesIcon, MessageSquare, ChevronDown, ChevronUp
} from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { useAuth } from '../../auth/context/AuthContext';
import { useWords } from '../../words/context/WordContext';
import { useAuthPopup } from '../../auth/hooks/useAuthPopup';
import { useVideoCall } from '../../video-call/context/VideoCallContext';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardSidebar: React.FC = () => {
  const { user } = useAuth();
  const { stats } = useDashboard();
  const { getLearnedWordsCount } = useWords();
  const { openAuthPopup } = useAuthPopup(); 
  const { startCall } = useVideoCall();
  const location = useLocation();

  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [showBadges, setShowBadges] = useState(true);

  const toggleMenu = () => setMenuCollapsed(!menuCollapsed);
  const toggleBadges = () => setShowBadges(!showBadges);

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
    e.preventDefault();
    if (!user) {
      openAuthPopup();
      return;
    }
    
    console.log("[DashboardSidebar] Koaly butonu tıklandı");
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
      icon: Home,
      label: 'Ana Sayfa',
      href: '/dashboard',
      description: 'Kelime öğrenmeye devam et'
    },
    {
      icon: Book,
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
    <aside className={`${menuCollapsed ? 'lg:col-span-1' : 'lg:col-span-3'} lg:sticky lg:top-8 transition-all duration-300`}>
      {/* Sidebar Container */}
      <motion.div 
        className={`bg-white border border-bs-100 rounded-2xl shadow-lg overflow-hidden
                  transition-all duration-300 ease-in-out mb-6
                  ${menuCollapsed ? 'lg:w-20' : 'lg:w-full'}`}
        layout
        animate={{ 
          width: menuCollapsed && window.innerWidth >= 1024 ? '5rem' : '100%',
          opacity: 1 
        }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Profile Header - Daraltma butonu içine taşındı */}
        <div className="bg-gradient-to-br from-bs-primary to-bs-800 p-6 relative">
          {/* Daraltma butonu yeni konumu */}
          <div className={`absolute ${menuCollapsed ? 'top-3 right-1/2 translate-x-1/2' : 'top-4 right-4'} z-20`}>
            <button 
              onClick={toggleMenu}
              className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center
                       hover:bg-white/30 transition-colors text-white/90 backdrop-blur-sm
                       border border-white/20 shadow-md"
              title={menuCollapsed ? "Menüyü genişlet" : "Menüyü daralt"}
            >
              {menuCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </div>

          <div className={`flex ${menuCollapsed ? 'justify-center' : 'items-center gap-4'}`}>
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 ring-2 ring-white/20 backdrop-blur-sm
                           shadow-lg relative z-10 flex items-center justify-center
                           hover:ring-white/40 transition-all duration-300 transform hover:scale-105">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-white text-xl font-bold">
                    {user?.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </div>
            </div>
            
            {!menuCollapsed && (
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white truncate">
                  {user?.username || 'Misafir'}
                </h2>
                <p className="text-white/80 text-sm truncate">
                  {user?.email || 'Giriş yapmadınız'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="bg-white/10 px-2 py-0.5 rounded-full text-xs text-white/90 flex items-center">
                    <BookOpen size={12} className="mr-1" />
                    <span>{stats.learnedWords} kelime</span> 
                  </div>
                  {stats.streak > 0 && (
                    <div className="bg-amber-500/20 px-2 py-0.5 rounded-full text-xs text-amber-200 flex items-center">
                      <Zap size={12} className="mr-1" />
                      <span>{stats.streak} gün</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Badges Section - Only show if not collapsed */}
        {!menuCollapsed && earnedBadges.length > 0 && (
          <div className="p-4 border-b border-bs-100">
            <div className="flex items-center justify-between mb-2" onClick={toggleBadges}>
              <h3 className="text-sm font-medium text-bs-navy flex items-center gap-2">
                <Award className="w-4 h-4 text-bs-primary" />
                Kazanılan Rozetler
              </h3>
              <button className="text-bs-navygri hover:text-bs-navy">
                {showBadges ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
            
            <AnimatePresence>
              {showBadges && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-wrap gap-2 overflow-hidden"
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className={`${menuCollapsed ? 'p-2' : 'p-3'} overflow-y-auto max-h-[calc(100vh-300px)]`}>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <li key={item.href}>
                  <div className="relative group">
                    <Link
                      to={item.href}
                      preventScrollReset={true}
                      className={`flex items-center ${menuCollapsed ? 'justify-center' : 'gap-3'} 
                                ${menuCollapsed ? 'p-2' : 'p-3'} rounded-xl transition-all relative cursor-pointer
                                ${isActive 
                                  ? 'bg-gradient-to-r from-bs-primary to-bs-800 text-white shadow-lg shadow-bs-primary/20' 
                                  : 'text-bs-navy hover:bg-bs-50 hover:-translate-y-0.5 hover:shadow-md'}`}
                    >
                      <div className={`${menuCollapsed ? 'w-10 h-10' : 'w-9 h-9'} rounded-lg flex items-center justify-center transition-all
                                    ${isActive 
                                      ? 'bg-white/10 text-white group-hover:bg-white/20' 
                                      : 'bg-bs-50 text-bs-navygri group-hover:text-bs-primary group-hover:scale-110'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      {!menuCollapsed && (
                        <>
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
                        </>
                      )}
                    </Link>
                    
                    {/* Tooltip - Daraltıldığında görünür */}
                    {menuCollapsed && (
                      <div className="fixed left-20 ml-2 top-auto z-[100] whitespace-nowrap p-2
                                  bg-white rounded-lg shadow-xl border border-bs-100 min-w-[180px]
                                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                  transition-all duration-200 origin-left pointer-events-none">
                        <div className="font-medium text-bs-navy">{item.label}</div>
                        <div className="text-xs text-bs-navygri">{item.description}</div>
                        <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-2 h-2 
                                    bg-white transform rotate-45 border-l border-t border-bs-100"></div>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Koaly Chat Button - Geri getirildi */}
        <div className={`${menuCollapsed ? 'px-2 py-4' : 'px-4 py-4'}`}>
          <div className="relative group">
            <button
              onClick={handlePracticeClick}
              className={`group relative w-full flex ${menuCollapsed ? 'flex-col' : 'items-center'} gap-4 p-4 rounded-2xl 
                        bg-gradient-to-r from-blue-600 via-bs-primary to-indigo-600
                        hover:shadow-xl transition-all duration-300
                        hover:-translate-y-1 overflow-hidden`}
            >
              <div className={`relative z-10 flex ${menuCollapsed ? 'flex-col' : 'items-start'} gap-4 w-full`}>
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

                {!menuCollapsed && (
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
                )}
              </div>

              {/* Animasyonlu arka plan efektleri */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 
                           translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-bs-primary blur opacity-30 
                           group-hover:opacity-50 transition duration-300 animate-pulse"></div>
            </button>
            
            {/* Koaly ile Konuş Tooltip - Daraltıldığında görünür */}
            {menuCollapsed && (
              <div className="fixed left-20 ml-2 top-auto z-[100] whitespace-nowrap p-3
                          bg-white rounded-lg shadow-xl border border-bs-100 min-w-[200px]
                          opacity-0 invisible group-hover:opacity-100 group-hover:visible
                          transition-all duration-200 origin-left pointer-events-none">
                <div className="font-semibold text-bs-navy text-base">Koaly ile Konuş</div>
                <div className="text-sm text-bs-navygri mb-2">Hemen İngilizce pratik yap!</div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-bs-50 px-2 py-0.5 rounded-full">
                    <HeadphonesIcon size={12} className="text-bs-primary" />
                    <span className="text-xs">Sesli Konuşma</span>
                  </div>
                  <div className="flex items-center gap-1 bg-bs-50 px-2 py-0.5 rounded-full">
                    <MessageSquare size={12} className="text-bs-primary" />
                    <span className="text-xs">Mesajlaşma</span>
                  </div>
                </div>
                <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-2 h-2 
                            bg-white transform rotate-45 border-l border-t border-bs-100"></div>
              </div>
            )}
          </div>
        </div>

        {/* Hızlı Aksiyonlar - İyileştirilmiş Tasarım */}
        <div className={`bg-gradient-to-br from-bs-50 to-white rounded-b-2xl overflow-hidden ${menuCollapsed ? 'hidden' : ''}`}>
          <div className="p-4 border-t border-bs-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bs-primary/10 to-bs-primary/20 flex items-center justify-center shadow-sm">
                  <Zap className="w-4 h-4 text-bs-primary" />
                </div>
                <h3 className="text-sm font-semibold text-bs-navy">
                  Hızlı Aksiyonlar
                </h3>
              </div>
              <div className="text-xs text-bs-navygri bg-white/80 px-2 py-1 rounded-full shadow-sm border border-bs-100/50">
                {stats.learnedWords} / 500 kelime
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-1 p-2">
            <div
              role="button"
              tabIndex={0}
              onClick={handleQuizClick}
              onKeyPress={(e) => e.key === 'Enter' && handleQuizClick(e as any)}
              className="w-full flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md 
                        transition-all duration-200 group cursor-pointer border border-bs-100/50
                        hover:border-bs-primary/20 hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/20 flex items-center justify-center
                           group-hover:bg-gradient-to-br group-hover:from-amber-500/20 group-hover:to-amber-500/30 transition-colors">
                <PenTool className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-medium text-bs-navy group-hover:text-bs-primary transition-colors">Sınav Ol</div>
                <div className="text-xs text-bs-navygri truncate">
                  Öğrendiklerini test et
                </div>
              </div>
              <div className="bg-bs-50 rounded-lg p-1.5 group-hover:bg-bs-primary/10 group-hover:text-bs-primary transition-all">
                <ChevronRight className="w-4 h-4 text-bs-navygri group-hover:text-bs-primary 
                              group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={handlePracticeClick}
              onKeyPress={(e) => e.key === 'Enter' && handlePracticeClick(e as any)}
              className="w-full flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md 
                        transition-all duration-200 group cursor-pointer border border-bs-100/50
                        hover:border-bs-primary/20 hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/20 flex items-center justify-center
                          group-hover:bg-gradient-to-br group-hover:from-purple-500/20 group-hover:to-purple-500/30 transition-colors">
                <HeadphonesIcon className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-medium text-bs-navy group-hover:text-bs-primary transition-colors">Koaly ile Konuş</div>
                <div className="text-xs text-bs-navygri truncate">
                  Canlı İngilizce pratik yap
                </div>
              </div>
              <div className="bg-bs-50 rounded-lg p-1.5 group-hover:bg-bs-primary/10 group-hover:text-bs-primary transition-all">
                <ChevronRight className="w-4 h-4 text-bs-navygri group-hover:text-bs-primary 
                              group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
            
            <div className="mt-2 text-center">
              <div className="text-xs text-bs-navygri py-2">
                Günlük streak: <span className="font-semibold text-bs-primary">{stats.streak || 0} gün</span>
              </div>
              <div className="w-full bg-bs-50 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-bs-primary to-purple-500 rounded-full"
                  style={{ width: `${Math.min((stats.streak || 0) * 3.33, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </aside>
  );
};
