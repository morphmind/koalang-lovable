import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Activity, Award, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useVideoCall } from '../../video-call/context/VideoCallContext';

// Işık efekti bileşeni
const GlowEffect: React.FC = () => (
  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/20 to-indigo-500/0 rounded-full blur-md opacity-60 animate-pulse-slow"></div>
);

// Menü öğesi bileşeni - metin iyileştirmeleri
const MenuItem: React.FC<{
  icon: React.ElementType;
  label: string;
  href: string;
  isActive: boolean;
}> = ({ icon: Icon, label, href, isActive }) => {
  return (
    <Link to={href} className="relative group">
      <div className="flex flex-col items-center justify-center">
        <div className={`relative flex items-center justify-center h-10 w-10 rounded-full 
                      transition-all duration-300 transform 
                      ${isActive 
                        ? 'bg-gradient-to-br from-bs-primary to-bs-800 text-white shadow-lg shadow-bs-primary/20' 
                        : 'bg-gray-50 text-bs-navygri hover:scale-105 hover:shadow-md'}`}>
          {/* Efekt katmanları */}
          {isActive && <GlowEffect />}
          <Icon size={isActive ? 20 : 18} className="relative z-10" />
        </div>
        
        {/* Alttaki küçük gösterge noktası */}
        <motion.div
          animate={{ 
            opacity: isActive ? 1 : 0, 
            scale: isActive ? 1 : 0.5,
            y: isActive ? 0 : 5
          }}
          transition={{ duration: 0.2 }}
          className="w-1 h-1 bg-bs-primary rounded-full mt-0.5"
        />
        
        <span className={`text-[11px] mt-0.5 transition-colors duration-200
                       ${isActive 
                          ? 'text-bs-primary font-semibold' 
                          : 'text-bs-navy/80 group-hover:text-bs-navy font-medium'}`}>
          {label}
        </span>
      </div>
    </Link>
  );
};

// Koaly butonu - doğrudan VideoCallContext'i kullanan versiyon
const KoalyButton: React.FC = () => {
  const { startCall } = useVideoCall();
  
  const handleClick = () => {
    console.log("[MobileFooterMenu] Koaly butonu tıklandı");
    startCall();
  };
  
  return (
    <div className="relative flex flex-col items-center">
      <button
        onClick={handleClick}
        type="button"
        className="relative h-11 w-11 rounded-full bg-gradient-to-r from-blue-600 via-bs-primary to-indigo-600 
                 flex items-center justify-center shadow-lg 
                 border-2 border-white scale-110 z-10 overflow-hidden
                 transform transition-transform hover:scale-105 active:scale-95"
      >
        <img 
          src="/koaly-avatar.svg" 
          alt="Koaly" 
          className="w-6 h-6 z-20"
        />
        
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full 
                    bg-green-500 border border-white animate-pulse z-30"></div>

        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 
                    opacity-0 hover:opacity-100 rounded-full z-10
                    translate-x-[-100%] animate-shimmer"></div>
      </button>
      
      <div className="w-1 h-1 bg-bs-primary rounded-full mt-0.5"></div>
      <span className="text-[11px] mt-0.5 font-semibold text-bs-primary">
        Koaly
      </span>
      
      <div className="absolute -inset-2 bg-bs-primary/10 blur-lg rounded-full 
                  opacity-70 animate-pulse-slow -z-10"></div>
    </div>
  );
};

export const MobileFooterMenu: React.FC = () => {
  const location = useLocation();
  
  const menuItems = [
    { icon: Home, label: 'Ana Sayfa', href: '/dashboard' },
    { icon: BookOpen, label: 'Kelimelerim', href: '/dashboard/learned-words' },
    { icon: Activity, label: 'İlerleme', href: '/dashboard/progress' },
    { icon: Award, label: 'Başarılar', href: '/dashboard/achievements' },
    { icon: Settings, label: 'Ayarlar', href: '/dashboard/settings' },
  ];
  
  const isActiveRoute = (route: string) => {
    if (route === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    return location.pathname.startsWith(route) && route !== '/dashboard';
  };

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe"
    >
      {/* Arkaplan ve buzlu cam efekti */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm border-t border-bs-100"></div>
      
      {/* Koaly için dikkat çekici ışık efekti */}
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-24 h-24 
                   bg-gradient-to-b from-bs-primary/20 to-transparent rounded-full blur-xl"></div>
      
      {/* Menü öğeleri - Daha kompakt padding */}
      <div className="relative flex justify-around items-center px-3 pt-1.5 pb-1">
        <MenuItem 
          icon={menuItems[0].icon} 
          label={menuItems[0].label} 
          href={menuItems[0].href} 
          isActive={isActiveRoute(menuItems[0].href)} 
        />
        
        <MenuItem 
          icon={menuItems[1].icon} 
          label={menuItems[1].label} 
          href={menuItems[1].href} 
          isActive={isActiveRoute(menuItems[1].href)} 
        />
        
        <KoalyButton />
        
        <MenuItem 
          icon={menuItems[2].icon} 
          label={menuItems[2].label} 
          href={menuItems[2].href} 
          isActive={isActiveRoute(menuItems[2].href)} 
        />
        
        <MenuItem 
          icon={menuItems[4].icon} 
          label={menuItems[4].label} 
          href={menuItems[4].href} 
          isActive={isActiveRoute(menuItems[4].href)} 
        />
      </div>
      
      {/* iPhone X ve üstü için güvenli alan - Daha küçük */}
      <div className="h-3 bg-white/80 backdrop-blur-sm"></div>
    </motion.div>
  );
}; 