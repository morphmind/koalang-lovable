import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth';
import { Header } from '../../../components';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { VideoCallProvider } from '../../video-call/context/VideoCallContext';
import { VideoCallModal } from '../../video-call/components/VideoCallModal';
import { useVideoCall } from '../../video-call/context/VideoCallContext';
import { MessageSquare, Video, HeadphonesIcon } from 'lucide-react';

const PracticeButton: React.FC = () => {
  const { startCall } = useVideoCall();
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);

  const handlePracticeClick = () => {
    setIsVideoCallOpen(true);
    startCall();
  };

  return (
    <>
      <div className="lg:fixed lg:bottom-24 lg:right-6 fixed bottom-0 left-0 right-0 z-50">
        <button
          onClick={handlePracticeClick}
          className="w-full lg:w-auto group relative flex items-center gap-4 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 text-white px-4 py-3 lg:px-6 lg:py-4 lg:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          {/* Sol taraf - Avatar ve mesaj balonu */}
          <div className="flex items-center gap-2 lg:gap-3 flex-1 lg:flex-initial justify-start">
            <div className="relative">
              <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full overflow-hidden bg-white/10 ring-2 ring-white/20 backdrop-blur-sm">
                <img src="/koaly-avatar.svg" alt="Koaly" className="w-full h-full" />
              </div>
              {/* Online göstergesi */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full ring-2 ring-white animate-pulse"></div>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-base lg:text-lg font-semibold">Koaly ile Konuş</span>
              <div className="hidden lg:flex items-center gap-2 text-sm text-blue-100">
                <span>Hemen sesli pratik yap!</span>
              </div>
            </div>
          </div>

          {/* Mobil için ikonlar */}
          <div className="flex lg:hidden items-center gap-4 ml-auto">
            <HeadphonesIcon size={20} className="text-white/90" />
            <MessageSquare size={20} className="text-white/90" />
          </div>

          {/* Desktop için özellik ikonları */}
          <div className="hidden lg:flex items-center gap-3 ml-4 border-l border-white/20 pl-4">
            <div className="flex flex-col items-center">
              <Video size={18} className="mb-1" />
              <span className="text-xs">Video</span>
            </div>
            <div className="flex flex-col items-center">
              <HeadphonesIcon size={18} className="mb-1" />
              <span className="text-xs">Sesli</span>
            </div>
            <div className="flex flex-col items-center">
              <MessageSquare size={18} className="mb-1" />
              <span className="text-xs">Mesaj</span>
            </div>
          </div>

          {/* Efektler */}
          <div className="absolute inset-0 lg:rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 group-hover:opacity-75 opacity-0 transition-opacity duration-300"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-400 lg:rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300 animate-pulse"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-400 lg:rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-300 animate-pulse delay-150"></div>
        </button>
      </div>

      {/* Video arama modalı */}
      <VideoCallModal />
    </>
  );
};

export const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isMainDashboard = location.pathname === '/dashboard' || location.pathname === '/dashboard/';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showLearned, setShowLearned] = useState(false);

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
        
        <main className="container mx-auto px-4 lg:px-8 pb-24">
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
        <PracticeButton />
      </div>
    </VideoCallProvider>
  );
};
