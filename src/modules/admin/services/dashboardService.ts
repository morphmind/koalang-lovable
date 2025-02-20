import { Database } from '../../../types/supabase';
import { createClient } from '@supabase/supabase-js';
import { addDays, startOfDay, endOfDay, subDays, format } from 'date-fns';
import { tr } from 'date-fns/locale';

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface DashboardStats {
  totalUsers: number;
  newUsersLast30Days: number;
  totalWordsLearned: number;
  averageDailyWords: number;
  totalQuizzesTaken: number;
  quizSuccessRate: number;
  totalExercises: number;
  exerciseCompletionRate: number;
}

export interface ActivityData {
  date: string;
  users: number;
  words: number;
  quizzes: number;
}

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const thirtyDaysAgo = subDays(new Date(), 30);
    
    // Toplam kullanıcı sayısı
    const { count: totalUsers, error: totalUsersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    if (totalUsersError) throw totalUsersError;

    // Son 30 gündeki yeni kullanıcılar
    const { count: newUsers, error: newUsersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (newUsersError) throw newUsersError;

    // Öğrenilen kelimeler
    const { data: learnedWords, error: learnedWordsError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('learned', true as any);

    if (learnedWordsError) throw learnedWordsError;

    // Son 24 saatteki öğrenilen kelimeler
    const oneDayAgo = subDays(new Date(), 1);
    const { data: dailyWords, error: dailyWordsError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('learned', true as any)
      .gte('last_reviewed', oneDayAgo.toISOString());

    if (dailyWordsError) throw dailyWordsError;

    // Quiz istatistikleri
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quiz_results')
      .select('*');

    if (quizzesError) throw quizzesError;

    const successfulQuizzes = quizzes?.filter(q => q.score >= 70) || [];

    // Egzersiz istatistikleri
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('*');

    if (exercisesError) throw exercisesError;

    const completedExercises = exercises?.filter(e => e.completed) || [];

    return {
      totalUsers: totalUsers || 0,
      newUsersLast30Days: newUsers || 0,
      totalWordsLearned: learnedWords?.length || 0,
      averageDailyWords: dailyWords?.length || 0,
      totalQuizzesTaken: quizzes?.length || 0,
      quizSuccessRate: quizzes?.length ? (successfulQuizzes.length / quizzes.length) * 100 : 0,
      totalExercises: exercises?.length || 0,
      exerciseCompletionRate: exercises?.length ? (completedExercises.length / exercises.length) * 100 : 0
    };
  },

  async getActivityData(period: 'week' | 'month'): Promise<ActivityData[]> {
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(
      period === 'week' ? subDays(endDate, 7) : subDays(endDate, 30)
    );

    // Tarih aralığındaki her gün için veri topla
    const dates = [];
    let currentDate = startDate;
    
    while (currentDate <= endDate) {
      dates.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }

    const activityData: ActivityData[] = await Promise.all(
      dates.map(async (date) => {
        const nextDay = addDays(date, 1);

        // O gün eklenen kullanıcılar
        const { count: users, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .gte('created_at', date.toISOString())
          .lt('created_at', nextDay.toISOString());

        if (usersError) throw usersError;

        // O gün öğrenilen kelimeler
        const { count: words, error: wordsError } = await supabase
          .from('user_progress')
          .select('*', { count: 'exact' })
          .eq('learned', true as any)
          .gte('last_reviewed', date.toISOString())
          .lt('last_reviewed', nextDay.toISOString());

        if (wordsError) throw wordsError;

        // O gün tamamlanan quizler
        const { count: quizzes, error: quizzesError } = await supabase
          .from('quiz_results')
          .select('*', { count: 'exact' })
          .gte('created_at', date.toISOString())
          .lt('created_at', nextDay.toISOString());

        if (quizzesError) throw quizzesError;

        return {
          date: period === 'week' 
            ? format(date, 'EEE', { locale: tr }) 
            : format(date, 'd MMM', { locale: tr }),
          users: users || 0,
          words: words || 0,
          quizzes: quizzes || 0
        };
      })
    );

    return activityData;
  }
};
