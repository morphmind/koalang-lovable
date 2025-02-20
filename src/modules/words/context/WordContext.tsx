import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';
import { Word } from '../../../data/oxford3000.types';
import { useAuth } from '../../auth';
import words from '../../../data/oxford3000';
import { Database } from '../../../lib/database.types';
import { TypedSupabaseClient } from '../../notifications/types';
import toast from 'react-hot-toast';

type Tables = Database['public']['Tables'];
type UserProgressInsert = Tables['user_progress']['Insert'];
type NotificationInsert = Tables['notifications']['Insert'];

interface WordState {
  learnedWords: { [key: string]: boolean };
  isLoading: boolean;
  error: string | null;
}

type WordAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { [key: string]: boolean } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'UPDATE_WORD'; payload: string };

const initialState: WordState = {
  learnedWords: {},
  isLoading: false,
  error: null
};

function wordReducer(state: WordState, action: WordAction): WordState {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        learnedWords: action.payload,
        isLoading: false,
        error: null
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      };
    case 'UPDATE_WORD':
      return {
        ...state,
        learnedWords: {
          ...state.learnedWords,
          [action.payload]: !state.learnedWords[action.payload]
        }
      };
    default:
      return state;
  }
}

interface WordContextType extends WordState {
  toggleWordLearned: (word: string) => Promise<void>;
  loadLearnedWords: () => Promise<void>;
  getLearnedWordsCount: () => number;
  getSuggestedWords: (limit?: number) => Promise<Word[]>;
}

const WordContext = createContext<{
  learnedWords: { [key: string]: boolean };
  isLoading: boolean;
  error: string | null;
  toggleWordLearned: (word: string) => Promise<void>;
  loadLearnedWords: () => Promise<void>;
  getLearnedWordsCount: () => number;
  getSuggestedWords: (limit?: number) => Promise<Word[]>;
} | undefined>(undefined);

export const WordProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wordReducer, initialState);
  const { user } = useAuth();
  const client = supabase as TypedSupabaseClient;

  // Kelime durumunu güncelle
  const updateWordProgress = async (userId: string, word: string, learned: boolean) => {
    try {
      const { error } = await client
        .from('user_progress')
        .upsert({
          user_id: userId,
          word,
          learned,
          last_reviewed: new Date().toISOString(),
          created_at: learned ? new Date().toISOString() : null
        }, {
          onConflict: 'user_id,word'
        });

      if (error) {
        console.error('Kelime durumu güncellenirken hata:', error);
        toast.error('Kelime durumu güncellenirken bir hata oluştu.');
        return;
      }

      dispatch({
        type: 'UPDATE_WORD',
        payload: word
      });

      // Başarılı mesajı göster
      toast.success(learned ? `"${word}" kelimesini öğrendiniz!` : `"${word}" kelimesi öğrenilmedi olarak işaretlendi.`);

      // Öğrenilme tarihlerini güncelle (LearnedWordsPage'de kullanılıyor)
      const event = new CustomEvent('updateLearningDates', {
        detail: {
          word,
          date: learned ? new Date().toISOString() : null
        }
      });
      window.dispatchEvent(event);

    } catch (error) {
      console.error('Kelime durumu güncellenirken hata:', error);
      toast.error('Kelime durumu güncellenirken bir hata oluştu.');
    }
  };

  // Kelime durumunu değiştir
  const toggleWordLearned = useCallback(async (word: string) => {
    try {
      const userId = user?.id;
      if (!userId) {
        toast.error('Lütfen giriş yapın');
        return;
      }

      dispatch({ type: 'UPDATE_WORD', payload: word });

      // Önce mevcut kaydı kontrol et
      const { data: existingData, error: checkError } = await client
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('word', word)
        .maybeSingle();

      if (checkError) {
        console.error('Kontrol hatası:', checkError);
        toast.error('Kelime durumu kontrol edilirken bir hata oluştu');
        dispatch({ type: 'UPDATE_WORD', payload: word });
        return;
      }

      const now = new Date().toISOString();
      let error;

      if (existingData) {
        // Kayıt varsa güncelle
        const { error: updateError } = await client
          .from('user_progress')
          .update({
            learned: !state.learnedWords[word],
            last_reviewed: now
          })
          .eq('user_id', userId)
          .eq('word', word);
        
        error = updateError;
      } else {
        // Kayıt yoksa yeni kayıt oluştur
        const { error: insertError } = await client
          .from('user_progress')
          .insert({
            user_id: userId,
            word: word,
            learned: !state.learnedWords[word],
            last_reviewed: now,
            created_at: now
          });
        
        error = insertError;
      }

      if (error) {
        console.error('Veritabanı hatası:', error);
        toast.error('Kelime kaydedilirken bir hata oluştu');
        dispatch({ type: 'UPDATE_WORD', payload: word });
        return;
      }

      const newLearningState = !state.learnedWords[word];
      toast.success(newLearningState ? 'Kelime öğrenildi olarak işaretlendi' : 'Kelime öğrenilmedi olarak işaretlendi');
    } catch (error) {
      console.error('Beklenmeyen hata:', error);
      toast.error('Bir hata oluştu');
      dispatch({ type: 'UPDATE_WORD', payload: word });
    }
  }, [user, state.learnedWords]);

  // Öğrenilen kelimeleri yükle
  const loadLearnedWords = useCallback(async () => {
    if (!user) return;

    dispatch({ type: 'FETCH_START' });

    try {
      const { data, error } = await client
        .from('user_progress')
        .select('word, learned')
        .eq('user_id', user.id);

      if (error) throw error;

      const learnedWordsMap = data.reduce((acc: { [key: string]: boolean }, item) => {
        acc[item.word] = item.learned;
        return acc;
      }, {});

      dispatch({ type: 'FETCH_SUCCESS', payload: learnedWordsMap });
    } catch (error) {
      console.error('Kelimeler yüklenirken hata:', error);
      dispatch({ type: 'FETCH_ERROR', payload: 'Kelimeler yüklenirken bir hata oluştu' });
    }
  }, [user]);

  // Öğrenilen kelime sayısını getir
  const getLearnedWordsCount = useCallback(() => {
    return Object.values(state.learnedWords).filter(Boolean).length;
  }, [state.learnedWords]);

  // Önerilen kelimeleri getir
  const getSuggestedWords = useCallback(async (limit: number = 5): Promise<Word[]> => {
    if (!user) return [];

    try {
      // Öğrenilmemiş kelimelerden rastgele seç
      const unlearned = words.filter(w => !state.learnedWords[w.word]);
      return unlearned
        .sort(() => Math.random() - 0.5)
        .slice(0, limit);
    } catch (err) {
      console.error('Önerilen kelimeler yüklenirken hata:', err);
      return [];
    }
  }, [user, state.learnedWords]);

  // İlk yükleme
  React.useEffect(() => {
    loadLearnedWords();
  }, [loadLearnedWords]);

  return (
    <WordContext.Provider value={{
      ...state,
      toggleWordLearned,
      loadLearnedWords,
      getLearnedWordsCount,
      getSuggestedWords
    }}>
      {children}
    </WordContext.Provider>
  );
};

export const useWords = () => {
  const context = useContext(WordContext);
  if (context === undefined) {
    throw new Error('useWords must be used within a WordProvider');
  }
  return context;
};