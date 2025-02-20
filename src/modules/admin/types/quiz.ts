export interface Quiz {
  id: string;
  title: string;
  description: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  type: 'daily' | 'practice' | 'test';
  status: 'draft' | 'published';
  questions: Question[];
  created_at: string;
  updated_at: string;
  total_attempts: number;
  average_score: number;
}

export interface Question {
  id: string;
  quiz_id: string;
  word_id: string;
  question_type: 'multiple_choice' | 'translation' | 'fill_blank';
  content: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
  order: number;
}

export interface QuizStats {
  total_quizzes: number;
  quizzes_by_level: {
    A1: number;
    A2: number;
    B1: number;
    B2: number;
    C1: number;
    C2: number;
  };
  quizzes_by_type: {
    daily: number;
    practice: number;
    test: number;
  };
  total_questions: number;
  average_completion_rate: number;
  average_success_rate: number;
}
