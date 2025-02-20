import React from 'react';
import { useProgress } from '../hooks/useProgress';
import { LoadingSpinner } from '../../auth/components/LoadingSpinner';
import { ErrorMessage } from '../../auth/components/ErrorMessage';
import { WeeklyChart } from '../components/WeeklyChart';
import { LevelProgress } from '../components/LevelProgress';
import { LearningProgress } from '../components/LearningProgress';
import { Activity } from 'lucide-react';

interface ProgressStats {
  dailyProgress: number;
  weeklyProgress: number;
  monthlyProgress: number;
}

export const ProgressPage: React.FC = () => {
  const { 
    getWeeklyProgress,
    getLevelDistribution,
    isLoading,
    error
  } = useProgress();

  const [weeklyProgress, setWeeklyProgress] = React.useState<number[]>([]);
  const [levelDistribution, setLevelDistribution] = React.useState<{[key: string]: number}>({});
  const [stats, setStats] = React.useState<ProgressStats>({
    dailyProgress: 0,
    weeklyProgress: 0,
    monthlyProgress: 0,
  });

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [weeklyData, levelData] = await Promise.all([
          getWeeklyProgress(),
          getLevelDistribution(),
        ]);

        setWeeklyProgress(weeklyData.map(d => d.count));
        setLevelDistribution(levelData);
      } catch (err) {
        console.error('İlerleme verileri yüklenirken hata:', err);
      }
    };

    loadData();
  }, []);

  React.useEffect(() => {
    // TODO: Gerçek verileri Supabase'den çekeceğiz
    // Şimdilik örnek veriler
    setStats({
      dailyProgress: 75,
      weeklyProgress: 60,
      monthlyProgress: 80,
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">
                  İlerleme Durumu
                </h1>
                <p className="text-white/80 flex items-center gap-2">
                  <span>Öğrenme yolculuğunuzdaki ilerlemenizi takip edin</span>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <span>Son 30 gün</span>
                </p>
              </div>
              <div className="flex items-center gap-3 text-white/80 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full backdrop-blur-sm">
                  <Activity className="w-4 h-4" />
                  <span>Günlük İlerleme: %{Math.round(stats.dailyProgress || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* İlerleme Hedefleri */}
      <LearningProgress 
        weeklyProgress={weeklyProgress}
        levelDistribution={levelDistribution}
        isLoading={isLoading}
        error={error}
      />

      {/* İstatistikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Haftalık İlerleme */}
        <WeeklyChart data={weeklyProgress} />

        {/* Seviye Dağılımı */}
        <LevelProgress distribution={levelDistribution} />
      </div>
    </div>
  );
};