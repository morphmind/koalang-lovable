import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth';
import { Header } from '../../../components';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { VideoCallProvider } from '../../video-call/context/VideoCallContext';
import { VideoCallModal } from '../../video-call/components/VideoCallModal';
import { useUser } from '@/modules/auth/hooks/useUser';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isMainDashboard = location.pathname === '/dashboard' || location.pathname === '/dashboard/';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showLearned, setShowLearned] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);

  if (!user) return null;

  return (
    <VideoCallProvider>
      <div className="min-h-screen bg-gray-50">
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showLearned={showLearned}
          setShowLearned={setShowLearned}
        />
        
        <main className="container mx-auto px-4 lg:px-8">
          {/* Header yüksekliği ve ekstra boşluk için mt-24 ekledik */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative mt-24">
            {/* Sol Sidebar */}
            <div className="lg:col-span-3">
              <div className="sticky top-24">
                <DashboardSidebar />
              </div>
            </div>

            {/* Ana İçerik */}
            <div className="lg:col-span-9">
              {isMainDashboard && (
                <DashboardHeader 
                  user={user}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  showLearned={showLearned}
                  setShowLearned={setShowLearned}
                />
              )}
              <Outlet />
            </div>
          </div>
        </main>
        
        {/* Koaly ile pratik butonu */}
        <div className="fixed bottom-24 right-6 z-50">
          <button
            onClick={() => setIsVideoCallOpen(true)}
            className="group relative flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 ring-2 ring-white/20 backdrop-blur-sm">
                <img src="/koaly-avatar.svg" alt="Koaly" className="w-full h-full" />
              </div>
              {/* Online göstergesi */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white"></div>
            </div>

            {/* Metin */}
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">Koaly ile Pratik</span>
              <span className="text-xs text-blue-100">Çevrimiçi</span>
            </div>

            {/* Parlama efekti */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 group-hover:opacity-75 opacity-0 transition-opacity duration-300"></div>

            {/* Pulse efekti */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300 animate-pulse"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-300 animate-pulse delay-150"></div>
          </button>
        </div>

        {/* Video arama modalı */}
        <VideoCallModal
          isOpen={isVideoCallOpen}
          onClose={() => setIsVideoCallOpen(false)}
        />
      </div>
    </VideoCallProvider>
  );
};