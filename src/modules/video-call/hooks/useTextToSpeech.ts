import { useCallback, useRef } from 'react';

interface UseTextToSpeechProps {
  language?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export const useTextToSpeech = ({
  language = 'en-US',
  onStart,
  onEnd
}: UseTextToSpeechProps = {}) => {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // Önceki konuşmayı durdur
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      
      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        onEnd?.();
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        onEnd?.();
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, [language, onStart, onEnd]);

  const stop = useCallback(() => {
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking: !!utteranceRef.current
  };
};
