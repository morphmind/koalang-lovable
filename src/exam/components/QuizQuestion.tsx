
import React from 'react';
import {
  Brain,
  Check,
  ChevronRight,
  X
} from 'lucide-react';

import { QuizQuestion as QuizQuestionType } from '../types';

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswer: (answer: string, timeSpent: number) => void;
  loading?: boolean;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  onAnswer,
  loading = false
}) => {
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(null);
  const startTime = React.useRef<number>(Date.now());

  const handleSubmit = () => {
    if (selectedAnswer) {
      const timeSpent = Date.now() - startTime.current;
      onAnswer(selectedAnswer, timeSpent);
    }
  };

  React.useEffect(() => {
    startTime.current = Date.now();
  }, [question]);

  return (
    <div className="space-y-8">
      {/* Question */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-bs-navy">{question.question}</h3>
        
        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option) => (
            <button
              key={option}
              onClick={() => setSelectedAnswer(option)}
              className={`p-4 rounded-xl border-2 transition-all duration-200
                ${selectedAnswer === option 
                  ? 'border-bs-primary bg-bs-primary/10' 
                  : 'border-bs-200 hover:border-bs-primary/50'}
              `}
              disabled={loading}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedAnswer || loading}
        className={`w-full py-3 px-6 rounded-xl font-medium text-white
          ${!selectedAnswer || loading
            ? 'bg-bs-300 cursor-not-allowed'
            : 'bg-bs-primary hover:bg-bs-primary/90'}
        `}
      >
        {loading ? (
          <span>Checking...</span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Submit Answer
            <ChevronRight className="w-4 h-4" />
          </span>
        )}
      </button>
    </div>
  );
};
