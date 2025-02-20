import React, { useState } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { User, Mail, Key, Smartphone, Bell, Eye, Palette, Shield, Settings } from 'lucide-react';
import { SettingsProvider } from '../context/SettingsContext';

export const SettingsLayout: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();
  const [activeMainTab, setActiveMainTab] = useState<'profile' | 'preferences'>(
    ['profile', 'email', 'password', 'phone'].includes(currentPath || 'profile') ? 'profile' : 'preferences'
  );

  const mainTabs = [
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      defaultPath: '/dashboard/settings/profile',
      subTabs: [
        { id: 'profile', label: 'Profil Bilgileri', icon: User, path: '/dashboard/settings/profile' },
        { id: 'email', label: 'Email', icon: Mail, path: '/dashboard/settings/email' },
        { id: 'password', label: 'Şifre', icon: Key, path: '/dashboard/settings/password' },
        { id: 'phone', label: 'Telefon', icon: Smartphone, path: '/dashboard/settings/phone' }
      ]
    },
    {
      id: 'preferences',
      label: 'Tercihler',
      icon: Bell,
      defaultPath: '/dashboard/settings/notifications',
      subTabs: [
        { id: 'notifications', label: 'Bildirimler', icon: Bell, path: '/dashboard/settings/notifications' },
        { id: 'privacy', label: 'Gizlilik', icon: Eye, path: '/dashboard/settings/privacy' },
        { id: 'appearance', label: 'Görünüm', icon: Palette, path: '/dashboard/settings/appearance' },
        { id: 'security', label: 'Güvenlik', icon: Shield, path: '/dashboard/settings/security' }
      ]
    }
  ];

  const navigate = useNavigate();

  const handleMainTabClick = (tabId: 'profile' | 'preferences', defaultPath: string) => {
    setActiveMainTab(tabId); 
    navigate(defaultPath, { replace: true });
  };
  // Aktif ana sekmeyi belirle
  React.useEffect(() => {
    const currentTab = currentPath || 'profile';
    const isProfileTab = ['profile', 'email', 'password', 'phone'].includes(currentTab);
    setActiveMainTab(isProfileTab ? 'profile' : 'preferences');
  }, [currentPath]);

  return (
    <SettingsProvider>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="bg-white rounded-2xl shadow-lg border border-bs-100 overflow-hidden relative hover:shadow-xl transition-all">
          {/* Gradient Background */}
          <div className="relative bg-gradient-to-br from-bs-primary to-bs-800 p-8">
            {/* Dekoratif Pattern */}
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5 pointer-events-none" />
            
            {/* Dekoratif Işık Efektleri */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-bs-600/20 rounded-full blur-3xl 
                         -translate-y-1/2 translate-x-1/2 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-bs-navy/20 rounded-full blur-2xl 
                         translate-y-1/2 -translate-x-1/2 animate-pulse" />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-1">
                    Ayarlar
                  </h1>
                  <p className="text-white/80 flex items-center gap-2">
                    <span>Hesap ayarlarınızı ve tercihlerinizi yönetin</span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <span>Kişiselleştirme</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ana Sekmeler */}
        <div className="bg-white rounded-2xl shadow-lg border border-bs-100 mb-6">
          <div className="flex flex-col items-center py-6">
            {/* Ana Sekmeler */}
            <div className="flex flex-wrap justify-center gap-2">
              {mainTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMainTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all
                    ${activeMainTab === tab.id 
                      ? 'bg-bs-primary text-white hover:text-white' 
                      : 'text-bs-navygri hover:bg-bs-50 hover:text-bs-navy'}`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Alt Sekmeler */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {mainTabs.find(t => t.id === activeMainTab)?.subTabs.map((subTab) => {
                const isActive = currentPath === subTab.path;
                return (
                  <Link
                    to={subTab.path}
                    key={subTab.path}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all
                      ${location.pathname === subTab.path 
                        ? 'bg-bs-primary text-white hover:text-white' 
                        : 'text-bs-navygri hover:bg-bs-50 hover:text-bs-navy'}`}
                  >
                    <subTab.icon className="w-5 h-5" />
                    <span className="font-medium">{subTab.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* İçerik */}
        <div className="bg-white rounded-2xl shadow-lg border border-bs-100">
          <Outlet />
        </div>
      </div>
    </SettingsProvider>
  );
};