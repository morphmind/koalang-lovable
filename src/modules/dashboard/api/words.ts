import { supabase } from '../../../lib/supabase';
import { Word } from '../../../data/oxford3000.types';
import words from '../../../data/oxford3000';
import { Database } from '../../../lib/database.types';
import { TypedSupabaseClient } from '../../notifications/types';

type Tables = Database['public']['Tables'];
type UserProgressInsert = Tables['user_progress']['Insert'];
type UserProgressRow = Tables['user_progress']['Row'];

const client = supabase as TypedSupabaseClient;

export const wordsAPI = {
  // Öğrenilen kelimeleri getir
  getLearnedWords: async (userId: string): Promise<string[]> => {
    try {
      const result = await client
        .from('user_progress')
        .select('word')
        .eq('user_id', userId)
        .eq('learned', true);

      if (result.error) throw result.error;
      if (!result.data) return [];
      
      return result.data.map(item => item.word);
    } catch (error) {
      console.error('Öğrenilen kelimeler yüklenirken hata:', error);
      throw error;
    }
  },

  // Kelimeyi öğrenildi olarak işaretle
  markWordAsLearned: async (userId: string, word: string): Promise<boolean> => {
    try {
      // Mevcut durumu kontrol et
      const result = await client
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('word', word)
        .single();

      if (result.error && result.error.code !== 'PGRST116') throw result.error;

      const existingProgress = result.data as UserProgressRow | null;

      // Yeni durumu belirle (toggle)
      const newLearnedState = existingProgress ? !existingProgress.learned : true;

      // Durumu güncelle veya yeni kayıt oluştur
      const progressData: UserProgressInsert = {
        user_id: userId,
        word,
        learned: newLearnedState,
        last_reviewed: new Date().toISOString()
      };

      const { error: upsertError } = await client
        .from('user_progress')
        .upsert(progressData, {
          onConflict: 'user_id,word'
        });

      if (upsertError) throw upsertError;

      return newLearnedState;
    } catch (error) {
      console.error('Kelime durumu güncellenirken hata:', error);
      throw error;
    }
  },

  // Kelimeyi öğrenilmedi olarak işaretle
  markWordAsUnlearned: async (userId: string, word: string): Promise<void> => {
    try {
      const progressData: UserProgressInsert = {
        user_id: userId,
        word,
        learned: false,
        last_reviewed: new Date().toISOString()
      };

      const { error } = await client
        .from('user_progress')
        .upsert(progressData, {
          onConflict: 'user_id,word'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Kelime öğrenilmedi olarak işaretlenirken hata:', error);
      throw error;
    }
  },

  // Önerilen kelimeleri getir
  getSuggestedWords: async (userId: string, limit: number = 5): Promise<Word[]> => {
    try {
      // Kullanıcının öğrendiği kelimeleri al
      const result = await client
        .from('user_progress')
        .select('word')
        .eq('user_id', userId)
        .eq('learned', true);

      if (result.error) throw result.error;

      // Öğrenilmemiş kelimelerden rastgele seç
      const learnedWords = new Set(result.data?.map(l => l.word) || []);
      const unlearned = words.filter(w => !learnedWords.has(w.word));
      
      return unlearned
        .sort(() => Math.random() - 0.5)
        .slice(0, limit);
    } catch (error) {
      console.error('Önerilen kelimeler yüklenirken hata:', error);
      throw error;
    }
  },

  // Kelime istatistiklerini getir
  getWordStats: async (userId: string) => {
    try {
      const result = await client
        .from('user_progress')
        .select('word, learned, last_reviewed')
        .eq('user_id', userId);

      if (result.error) throw result.error;
      if (!result.data) return { totalLearned: 0, totalWords: words.length, lastReviewed: null };

      const validData = result.data.filter(item => item && typeof item.learned === 'boolean');

      return {
        totalLearned: validData.filter(w => w.learned).length,
        totalWords: words.length,
        lastReviewed: validData.length > 0 
          ? new Date(Math.max(...validData.map(w => new Date(w.last_reviewed).getTime())))
          : null
      };
    } catch (error) {
      console.error('Kelime istatistikleri yüklenirken hata:', error);
      throw error;
    }
  }
};