import { supabase } from '@/lib/supabase';
import { Word, WordStats } from '../types/word';

export const wordService = {
  async getWords(): Promise<Word[]> {
    const { data: words, error } = await supabase
      .from('words')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return words;
  },

  async getWordById(id: string): Promise<Word> {
    const { data: word, error } = await supabase
      .from('words')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return word;
  },

  async getWordStats(): Promise<WordStats> {
    const { data: stats, error } = await supabase
      .rpc('get_word_stats');

    if (error) throw error;
    return stats;
  },

  async createWord(word: Omit<Word, 'id' | 'created_at' | 'updated_at' | 'usage_count' | 'success_rate'>): Promise<Word> {
    const { data, error } = await supabase
      .from('words')
      .insert([word])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateWord(id: string, word: Partial<Word>): Promise<Word> {
    const { data, error } = await supabase
      .from('words')
      .update(word)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteWord(id: string): Promise<void> {
    const { error } = await supabase
      .from('words')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async searchWords(query: string): Promise<Word[]> {
    const { data: words, error } = await supabase
      .from('words')
      .select('*')
      .or(`english.ilike.%${query}%,turkish.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return words;
  }
};
