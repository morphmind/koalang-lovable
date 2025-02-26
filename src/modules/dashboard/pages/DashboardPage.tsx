import React from 'react';
import { LearningProgress } from '../components/LearningProgress';
import { RecentActivity } from '../components/RecentActivity';
import { LoadingSpinner } from '../../auth/components/LoadingSpinner';
import { ErrorMessage } from '../../auth/components/ErrorMessage';
import { useDashboard } from '../context/DashboardContext';
import { useProgress } from '../hooks/useProgress';
import { useAuth } from '../../auth';
import { Activity } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { isLoading, error } = useDashboard();
  const { 
    getWeeklyProgress,
    getLevelDistribution,
    getRecentActivities,
    isLoading: loadingProgress,
    error: progressError
  } = useProgress();
  const [weeklyProgress, setWeeklyProgress] = React.useState<number[]>([]);
  const [levelDistribution, setLevelDistribution] = React.useState<{[key: string]: number}>({});
  const [recentActivities, setRecentActivities] = React.useState<Activity[]>([]);

  // İlerleme verilerini yükle
  React.useEffect(() => {
    if (!user) return;

    const loadProgressData = async () => {
      try {
        const [weeklyData, levelData, activities] = await Promise.all([
          getWeeklyProgress(),
          getLevelDistribution(),
          getRecentActivities(5)
        ]);

        // Haftalık ilerlemeyi düzenle
        const weeklyValues = weeklyData.map(item => item.count);
        setWeeklyProgress(weeklyValues);

        // Seviye dağılımını ayarla
        setLevelDistribution(levelData);

        // Son aktiviteleri ayarla
        setRecentActivities(activities as Activity[]);
      } catch (err) {
        console.error('İlerleme verileri yüklenirken hata:', err);
      }
    };

    loadProgressData();
  }, [user, getWeeklyProgress, getLevelDistribution, getRecentActivities]);



  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ErrorMessage message="Lütfen giriş yapın" />
      </div>
    );
  }

  if (isLoading || loadingProgress) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || progressError) {
    return (
      <div className="p-4">
        <ErrorMessage message={error || progressError || 'Bir hata oluştu'} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* İlerleme ve Aktiviteler - Yan Yana */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <LearningProgress 
          weeklyProgress={weeklyProgress}
          levelDistribution={levelDistribution}
          isLoading={loadingProgress}
          error={progressError}
        />
        <RecentActivity 
          activities={recentActivities} 
          isLoading={loadingProgress}
          error={progressError}
        />
      </div>
    </div>
  );
};