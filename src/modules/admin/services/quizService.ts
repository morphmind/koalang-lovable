import { supabase } from '@/lib/supabase';
import { Quiz, Question, QuizStats } from '../types/quiz';

export const quizService = {
  async getQuizzes(): Promise<Quiz[]> {
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return quizzes;
  },

  async getQuizById(id: string): Promise<Quiz> {
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return quiz;
  },

  async getQuizStats(): Promise<QuizStats> {
    const { data: stats, error } = await supabase
      .rpc('get_quiz_stats');

    if (error) throw error;
    return stats;
  },

  async createQuiz(quiz: Omit<Quiz, 'id' | 'created_at' | 'updated_at' | 'total_attempts' | 'average_score'>): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([quiz])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateQuiz(id: string, quiz: Partial<Quiz>): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .update(quiz)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteQuiz(id: string): Promise<void> {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async createQuestion(question: Omit<Question, 'id'>): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .insert([question])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateQuestion(id: string, question: Partial<Question>): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .update(question)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async reorderQuestions(quizId: string, questionIds: string[]): Promise<void> {
    const updates = questionIds.map((id, index) => ({
      id,
      order: index + 1
    }));

    const { error } = await supabase
      .from('questions')
      .upsert(updates);

    if (error) throw error;
  }
};
