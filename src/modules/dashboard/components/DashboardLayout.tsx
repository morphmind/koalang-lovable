
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth';
import { Header } from '../../../components';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { VideoCallProvider } from '../../video-call/context/VideoCallContext';
import { VideoCallModal } from '../../video-call/components/VideoCallModal';
import { useVideoCall } from '../../video-call/context/VideoCallContext';
import { MessageSquare, HeadphonesIcon } from 'lucide-react';
import { LoadingOverlay } from '../../../components';
import { useToast } from '@/components/ui/use-toast';

const PracticeButton: React.FC = () => {
  const { startCall } = useVideoCall();
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const { toast } = useToast();

  const handlePracticeClick = async () => {
    try {
      setIsVideoCallOpen(true);
      await startCall();
    } catch (error) {
      console.error('Failed to start call:', error);
      toast({
        title: "Bağlantı Hatası",
        description: "Görüşme başlatılırken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
      setIsVideoCallOpen(false);
    }
  };

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <button
          onClick={handlePracticeClick}
          className="w-full group relative flex items-center gap-4 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 text-white px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center gap-2 flex-1 justify-start">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 ring-2 ring-white/20 backdrop-blur-sm">
                <img src="/koaly-avatar.svg" alt="Koaly" className="w-full h-full" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white animate-pulse"></div>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-base font-semibold">Koaly ile Konuş</span>
              <span className="text-sm text-blue-100">İngilizce pratiği yap</span>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <HeadphonesIcon size={20} className="text-white/90" />
            <MessageSquare size={20} className="text-white/90" />
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 group-hover:opacity-75 opacity-0 transition-opacity duration-300"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-400 blur opacity-30 group-hover:opacity-50 transition duration-300 animate-pulse"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-400 blur opacity-20 group-hover:opacity-40 transition duration-300 animate-pulse delay-150"></div>
        </button>
      </div>

      <VideoCallModal />
    </>
  );
};

export const DashboardLayout: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const isMainDashboard = location.pathname === '/dashboard' || location.pathname === '/dashboard/';
  const [initializingApp, setInitializingApp] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLearned, setShowLearned] = useState(false);

  useEffect(() => {
    // This handles initialization of app resources
    const initializeApp = async () => {
      try {
        // Add any necessary initialization here
        await new Promise(resolve => setTimeout(resolve, 500)); // Minimum loading time
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setInitializingApp(false);
      }
    };

    if (!authLoading && user) {
      initializeApp();
    }
  }, [authLoading, user]);

  if (authLoading || initializingApp) {
    return <LoadingOverlay message="Yükleniyor..." />;
  }

  if (!user) {
    return null;
  }

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
            <div className="lg:col-span-3">
              <div className="sticky top-24">
                <DashboardSidebar />
              </div>
            </div>

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
        
        <PracticeButton />
      </div>
    </VideoCallProvider>
  );
};

