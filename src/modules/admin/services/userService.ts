import { Database } from '../../../types/supabase';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

import { PostgrestError } from '@supabase/supabase-js';
import { User, UserActivity } from '../types/user';

type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'admin';
  status: string;
  created_at: string;
  last_sign_in_at: string | null;
};

export const userService = {
  async getUsers(): Promise<UserProfile[]> {
    // Profilleri al
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Profil yükleme hatası:', error);
      throw error;
    }

    // Her profil için quiz sonuçlarını ve ilerlemeyi al
    const usersWithStats = await Promise.all((profiles || []).map(async (profile) => {
      try {
        // Quiz sonuçlarını al
        const { data: quizResults } = await supabase
          .from('quiz_results')
          .select('total_questions, correct_answers')
          .eq('user_id', profile.id);

        // İlerleme bilgisini al
        const { data: progress } = await supabase
          .from('user_progress')
          .select('last_reviewed')
          .eq('user_id', profile.id)
          .eq('learned', true);

        // Quiz istatistiklerini hesapla
        const totalQuestions = (quizResults || []).reduce((sum, quiz) => sum + quiz.total_questions, 0);
        const correctAnswers = (quizResults || []).reduce((sum, quiz) => sum + quiz.correct_answers, 0);
        const averageScore = totalQuestions > 0 
          ? (correctAnswers / totalQuestions) * 100 
          : 0;

        // Streak hesaplama
        let streakDays = 0;
        if (progress && progress.length > 0) {
          const today = new Date();
          const dates = progress.map(p => new Date(p.last_reviewed));
          dates.sort((a, b) => b.getTime() - a.getTime());

          let currentDate = dates[0];
          while (
            currentDate.getDate() >= today.getDate() - streakDays &&
            dates.some(date => 
              date.getDate() === currentDate.getDate() &&
              date.getMonth() === currentDate.getMonth() &&
              date.getFullYear() === currentDate.getFullYear()
            )
          ) {
            streakDays++;
            currentDate.setDate(currentDate.getDate() - 1);
          }
        }

        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name || '',
          role: profile.role || 'student',
          status: profile.status || 'inactive',
          created_at: profile.created_at,
          last_active: profile.last_sign_in_at,
          progress: {
            total_words: progress?.length || 0,
            quizzes_taken: quizResults?.length || 0,
            average_score: Number(averageScore.toFixed(1)),
            streak_days: streakDays
          }
        };
      } catch (err) {
        console.error(`Kullanıcı istatistikleri yüklenirken hata: ${profile.id}`, err);
        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name || '',
          role: profile.role || 'student',
          status: profile.status || 'inactive',
          created_at: profile.created_at,
          last_active: profile.last_sign_in_at,
          progress: {
            total_words: 0,
            quizzes_taken: 0,
            average_score: 0,
            streak_days: 0
          }
        };
      }
    }));

    return usersWithStats;
  },

  async createUser(userData: {
    email: string;
    password: string;
    full_name: string;
    role?: 'student' | 'admin';
  }): Promise<UserProfile> {
    // Auth kullanıcısı oluştur
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name,
          role: userData.role || 'student'
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Kullanıcı oluşturulamadı');

    // Profil bilgilerini oluştur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role || 'student',
          status: 'active'
        }
      ])
      .select()
      .single();

    if (profileError) {
      // Profil oluşturulamazsa auth kullanıcısını sil
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role as 'student' | 'admin',
      status: profile.status,
      created_at: profile.created_at,
      last_sign_in_at: profile.last_sign_in_at
    };
  },

  async getUserById(id: string): Promise<UserProfile> {
    // Profil bilgilerini al
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Kullanıcı bulunamadı');

    // Quiz sonuçlarını al
    const { data: quizResults, error: quizError } = await supabase
      .from('quiz_results')
      .select('total_questions, correct_answers')
      .eq('user_id', id);

    if (quizError) throw quizError;

    // İlerleme bilgisini al
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('last_reviewed')
      .eq('user_id', id)
      .eq('learned', true);

    if (progressError) throw progressError;

    // Quiz istatistiklerini hesapla
    const totalQuestions = (quizResults || []).reduce((sum, quiz) => sum + quiz.total_questions, 0);
    const correctAnswers = (quizResults || []).reduce((sum, quiz) => sum + quiz.correct_answers, 0);
    const averageScore = totalQuestions > 0 
      ? (correctAnswers / totalQuestions) * 100 
      : 0;

    // Streak hesaplama
    let streakDays = 0;
    if (progress && progress.length > 0) {
      const today = new Date();
      const dates = progress.map(p => new Date(p.last_reviewed));
      dates.sort((a, b) => b.getTime() - a.getTime());

      let currentDate = dates[0];
      while (
        currentDate.getDate() >= today.getDate() - streakDays &&
        dates.some(date => 
          date.getDate() === currentDate.getDate() &&
          date.getMonth() === currentDate.getMonth() &&
          date.getFullYear() === currentDate.getFullYear()
        )
      ) {
        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
    }

    return {
      id: profile.id,
      email: profile.email || '',
      full_name: profile.full_name || '',
      role: profile.role as 'student' | 'admin',
      status: profile.status || 'inactive',
      created_at: profile.created_at,
      last_sign_in_at: profile.last_sign_in_at
    };
  },

  async getUserActivities(userId: string): Promise<UserActivity[]> {
    // Quiz sonuçlarını al
    const { data: quizResults, error: quizError } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (quizError) throw quizError;

    // Öğrenilen kelimeleri al
    const { data: learnedWords, error: wordsError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('learned', true)
      .order('last_reviewed', { ascending: false })
      .limit(10);

    if (wordsError) throw wordsError;

    const activities: UserActivity[] = [
      ...(quizResults || []).map(quiz => ({
        id: `quiz_${quiz.id}`,
        user_id: userId,
        action_type: 'quiz_completed' as const,
        details: `Quiz tamamlandı. Skor: ${((quiz.correct_answers / quiz.total_questions) * 100).toFixed(1)}%`,
        created_at: quiz.created_at
      })),
      ...(learnedWords || []).map(word => ({
        id: `word_${word.id}`,
        user_id: userId,
        action_type: 'word_learned' as const,
        details: `Yeni kelime öğrenildi: ${word.word}`,
        created_at: word.last_reviewed
      }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return activities;
  },

  async updateUserStatus(userId: string, status: 'active' | 'inactive'): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ status } as any)
      .eq('id', userId as any);

    if (error) throw error;
  },

  async resetUserPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  }
};
