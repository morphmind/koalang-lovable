export interface Word {
  id: string;
  english: string;
  turkish: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  category: string;
  example_sentence: string;
  created_at: string;
  updated_at: string;
  usage_count: number;
  success_rate: number;
}

export interface WordStats {
  total_words: number;
  words_by_level: {
    A1: number;
    A2: number;
    B1: number;
    B2: number;
    C1: number;
    C2: number;
  };
  most_learned_categories: Array<{
    category: string;
    count: number;
  }>;
  average_success_rate: number;
}
