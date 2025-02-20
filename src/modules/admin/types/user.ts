export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'student';
  status: 'active' | 'inactive';
  created_at: string;
  last_active: string | null;
  progress: {
    total_words: number;
    quizzes_taken: number;
    average_score: number;
    streak_days: number;
  };
}

export interface UserActivity {
  id: string;
  user_id: string;
  action_type: 'quiz_completed' | 'word_learned';
  details: string;
  created_at: string;
}
