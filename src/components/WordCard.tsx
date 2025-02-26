import React, { useState } from 'react';
import { Volume2, Bookmark, Check, CornerRightDown } from 'lucide-react';

// Eksik Word tipi doğrudan tanımlandı
interface Word {
  word: string;
  meaning: string;
  level: string;
  phonetic?: string;
  type?: string;
  example?: string;
}

interface WordCardProps {
  word: Word;
  isLearned: boolean;
  onToggleLearned: (word: string) => void;
  onSpeak: (text: string) => void;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  isLearned,
  onToggleLearned,
  onSpeak
}) => {
  const [flipped, setFlipped] = useState(false);
  const [bouncing, setBouncing] = useState(false);

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleToggleLearned = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBouncing(true);
    setTimeout(() => setBouncing(false), 500);
    onToggleLearned(word.word);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSpeak(word.word);
  };

  const levelColors = {
    a1: 'bg-green-50 text-green-600',
    a2: 'bg-emerald-50 text-emerald-600',
    b1: 'bg-blue-50 text-blue-600',
    b2: 'bg-indigo-50 text-indigo-600',
    c1: 'bg-purple-50 text-purple-600',
    c2: 'bg-violet-50 text-violet-600',
  };

  const levelColor = levelColors[word.level.toLowerCase() as keyof typeof levelColors] || levelColors.a1;

  return (
    <div
      className={`word-card-container w-full relative select-none`}
      onClick={handleFlip}
    >
      <div
        className={`word-card relative transition-all duration-300 transform perspective-1000 ${
          flipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of the card */}
        <div
          className={`word-card-front rounded-2xl p-6 cursor-pointer transition-transform 
                   ${bouncing ? 'animate-bounce-sm' : ''}
                   bg-white dark:bg-gray-800
                   shadow-[8px_8px_16px_rgba(0,0,0,0.07),-8px_-8px_16px_rgba(255,255,255,0.8)]
                   dark:shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(30,30,30,0.2)]
                   border border-gray-100 dark:border-gray-700
                   relative z-10 backface-hidden`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${levelColor}`}>{word.level.toUpperCase()}</span>
              {word.type && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700">
                  {word.type}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <button 
                onClick={handleSpeak}
                className="neuro-button w-8 h-8 rounded-lg flex items-center justify-center
                         transition-all hover:text-bs-primary active:scale-95
                         bg-gray-50 dark:bg-gray-700
                         shadow-[3px_3px_6px_rgba(0,0,0,0.05),-3px_-3px_6px_rgba(255,255,255,0.8)]
                         dark:shadow-[3px_3px_6px_rgba(0,0,0,0.2),-3px_-3px_6px_rgba(30,30,30,0.2)]"
                aria-label="Kelimeyi seslendir"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button 
                onClick={handleToggleLearned}
                className={`neuro-button w-8 h-8 rounded-lg flex items-center justify-center
                          transition-all active:scale-95
                          ${isLearned ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'}
                          shadow-[3px_3px_6px_rgba(0,0,0,0.05),-3px_-3px_6px_rgba(255,255,255,0.8)]
                          dark:shadow-[3px_3px_6px_rgba(0,0,0,0.2),-3px_-3px_6px_rgba(30,30,30,0.2)]`}
                aria-label={isLearned ? "Öğrenildi olarak işaretle" : "Öğrenilmedi olarak işaretle"}
              >
                {isLearned ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="text-center py-2">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-1">
              {word.word}
            </h3>
            {word.phonetic && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">{word.phonetic}</p>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <CornerRightDown className="w-4 h-4 opacity-60" />
              <span>Anlamı görmek için kartı çevir</span>
            </div>
          </div>
        </div>

        {/* Back of the card */}
        <div
          className={`word-card-back absolute inset-0 rounded-2xl p-6 cursor-pointer
                   bg-gray-50 dark:bg-gray-900
                   shadow-[8px_8px_16px_rgba(0,0,0,0.07),-8px_-8px_16px_rgba(255,255,255,0.8)]
                   dark:shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(30,30,30,0.2)]
                   border border-gray-100 dark:border-gray-700
                   rotate-y-180 backface-hidden`}
        >
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${levelColor}`}>{word.level.toUpperCase()}</span>
            
            <div className="flex items-center space-x-1">
              <button 
                onClick={handleSpeak}
                className="neuro-button w-8 h-8 rounded-lg flex items-center justify-center
                         transition-all hover:text-bs-primary active:scale-95
                         bg-gray-50 dark:bg-gray-700
                         shadow-[3px_3px_6px_rgba(0,0,0,0.05),-3px_-3px_6px_rgba(255,255,255,0.8)]
                         dark:shadow-[3px_3px_6px_rgba(0,0,0,0.2),-3px_-3px_6px_rgba(30,30,30,0.2)]"
                aria-label="Kelimeyi seslendir"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button 
                onClick={handleToggleLearned}
                className={`neuro-button w-8 h-8 rounded-lg flex items-center justify-center
                          transition-all active:scale-95
                          ${isLearned ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'}
                          shadow-[3px_3px_6px_rgba(0,0,0,0.05),-3px_-3px_6px_rgba(255,255,255,0.8)]
                          dark:shadow-[3px_3px_6px_rgba(0,0,0,0.2),-3px_-3px_6px_rgba(30,30,30,0.2)]`}
                aria-label={isLearned ? "Öğrenildi olarak işaretle" : "Öğrenilmedi olarak işaretle"}
              >
                {isLearned ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="text-center h-full flex flex-col justify-center">
            <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Türkçe Anlamı</h4>
            <p className="text-lg md:text-xl font-medium text-gray-900 dark:text-gray-100">
              {word.meaning}
            </p>
            
            {word.example && (
              <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium text-indigo-700 dark:text-indigo-300">Örnek: </span>
                <span className="italic">{word.example}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 