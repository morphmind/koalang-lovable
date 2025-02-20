import { useEffect, useRef, useCallback } from 'react';

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void;
  onEnd?: () => void;
  language?: string;
  onError?: (error: string) => void;
}

// Web Speech API için tip tanımlamaları
interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  addEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void;
  addEventListener(type: 'error', listener: (event: SpeechRecognitionErrorEvent) => void): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export const useSpeechRecognition = ({
  onResult,
  onEnd,
  language = 'en-US',
  onError
}: UseSpeechRecognitionProps) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.addEventListener('result', (event: SpeechRecognitionEvent) => {
        const results = event.results;
        const transcript = Array.from(results)
          .map(result => {
            if (result && result[0]) {
              return result[0].transcript;
            }
            return '';
          })
          .join('');
        onResult(transcript);
      });

      recognition.addEventListener('end', () => {
        onEnd?.();
        // Otomatik olarak yeniden başlat
        if (recognitionRef.current) {
          recognition.start();
        }
      });

      recognition.addEventListener('error', (event: SpeechRecognitionErrorEvent) => {
        onError?.(event.message || 'Bir hata oluştu');
        onEnd?.();
      });

      recognitionRef.current = recognition;
      recognition.start();
    }
  }, [onResult, onEnd, language, onError]);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopRecognition();
    };
  }, [stopRecognition]);

  return {
    startRecognition,
    stopRecognition,
    isListening: !!recognitionRef.current
  };
};
