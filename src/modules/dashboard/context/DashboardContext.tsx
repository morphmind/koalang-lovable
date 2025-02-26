import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { DashboardState, DashboardStats } from '../types';
import { dashboardReducer } from './dashboardReducer';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth';

// Supabase'den dönen veriler için tip tanımları
interface UserProgress {
  id: string;
  word: string;
  created_at: string;
  user_id: string;
  learned: boolean;
}

interface QuizResult {
  id: string;
  user_id: string;
  difficulty: string;
  total_questions: number;
  correct_answers: number;
  created_at: string;
}

interface DashboardContextType extends DashboardState {
  loadDashboardStats: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const initialState: DashboardState = {
  stats: {
    learnedWords: 0,
    totalWords: 3000,
    successRate: 0,
    streak: 0,
    quizCount: 0,
    recentActivities: []
  },
  isLoading: false,
  error: null
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);
  const { user } = useAuth();

  const loadDashboardStats = useCallback(async () => {
    if (!user) return;

    dispatch({ type: 'FETCH_START' });

    try {
      // Öğrenilen kelimeler
      const { data: learnedData, error: learnedError } = await supabase
        .from('user_progress')
        .select('word')
        .eq('learned', true as any)
        .eq('user_id', user.id as any);

      if (learnedError) throw learnedError;

      // Quiz sonuçları - tip kontrolü eklendi
      const { data: quizResultsData, error: quizError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', user.id as any)
        .order('created_at', { ascending: false })
        .limit(10);

      if (quizError) throw quizError;
      
      // Tip kontrolü yapılmış quiz sonuçları
      const quizResults = quizResultsData as unknown as QuizResult[] | null;

      // Son aktiviteler - tip kontrolü eklendi
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id as any)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) throw activitiesError;
      
      // Tip kontrolü yapılmış aktiviteler
      const activities = activitiesData as unknown as UserProgress[] | null;

      // Tüm aktiviteleri birleştir - güvenli erişim
      const allActivities = [
        ...(activities || []).map(activity => {
          // Güvenli erişim için tip kontrolü
          if (!activity || typeof activity !== 'object') return null;
          
          return {
            id: String(activity.id || ''),
            type: 'learning' as const,
            title: 'Yeni Kelime Öğrenildi',
            description: `"${String(activity.word || '')}" kelimesini öğrendin`,
            result: 'success' as const,
            timestamp: new Date(String(activity.created_at || new Date()))
          };
        }).filter(Boolean), // null değerleri filtrele
        
        ...(quizResults || []).map(quiz => {
          // Güvenli erişim için tip kontrolü
          if (!quiz || typeof quiz !== 'object') return null;
          
          const correctAnswers = Number(quiz.correct_answers || 0);
          const totalQuestions = Number(quiz.total_questions || 0);
          
          return {
            id: String(quiz.id || ''),
            type: 'quiz' as const,
            title: `${String(quiz.difficulty || '')} Seviye Sınavı`,
            description: `${totalQuestions} sorudan ${correctAnswers} doğru`,
            result: correctAnswers > totalQuestions * 0.7 ? 'success' as const : 'failure' as const,
            timestamp: new Date(String(quiz.created_at || new Date()))
          };
        }).filter(Boolean) // null değerleri filtrele
      ].sort((a, b) => b!.timestamp.getTime() - a!.timestamp.getTime())
       .slice(0, 10);
      
      // Sınav sonuçlarını hesapla
      const totalCorrect = quizResults?.reduce((sum, result) => {
        if (!result || typeof result !== 'object') return sum;
        return sum + Number(result.correct_answers || 0);
      }, 0) || 0;
      
      const totalQuestions = quizResults?.reduce((sum, result) => {
        if (!result || typeof result !== 'object') return sum;
        return sum + Number(result.total_questions || 0);
      }, 0) || 0;
      
      const quizCount = quizResults?.length || 0;

      // Son aktivite
      const { data: lastActivityData, error: streakError } = await supabase
        .from('user_progress')
        .select('created_at')
        .eq('user_id', user.id as any)
        .order('created_at', { ascending: false })
        .limit(1);

      if (streakError) throw streakError;
      
      // Güvenli erişim
      const streak = lastActivityData as { created_at: string }[] | null;

      // Başarı oranı
      const successRate = totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0;

      // Günlük seri hesaplama - güvenli erişim
      const lastActivityDate = streak && streak.length > 0 && streak[0]?.created_at 
        ? String(streak[0].created_at) 
        : undefined;
        
      const streakCount = calculateStreak(lastActivityDate);

      // Son aktivite güvenli erişim
      const lastActivity = activities && activities.length > 0 && activities[0]?.created_at 
        ? new Date(String(activities[0].created_at)) 
        : undefined;

      const stats: DashboardStats = {
        learnedWords: learnedData?.length || 0,
        totalWords: 3000,
        successRate,
        quizCount,
        streak: streakCount,
        lastActivity,
        recentActivities: allActivities as any
      };

      dispatch({ type: 'FETCH_SUCCESS', payload: stats });
    } catch (error) {
      console.error('Dashboard stats yüklenirken hata:', error);
      dispatch({ type: 'FETCH_ERROR', payload: 'İstatistikler yüklenirken bir hata oluştu.' });
    }
  }, [user]);

  const refreshStats = useCallback(async () => {
    await loadDashboardStats();
  }, [loadDashboardStats]);

  // İlk yükleme
  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user, loadDashboardStats]);

  const value = {
    ...state,
    loadDashboardStats,
    refreshStats
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard hook must be used within a DashboardProvider');
  }
  return context;
};

function calculateStreak(lastActivityDate?: string): number {
  if (!lastActivityDate) return 0;

  const lastActivity = new Date(lastActivityDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastActivity.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Eğer son aktivite bugün veya dün ise seriyi devam ettir
  return diffDays <= 1 ? 1 : 0;
}