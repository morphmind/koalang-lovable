
import { useState, useEffect, useCallback, useRef } from 'react';
import { AudioRecorder, AudioQueue, encodeAudioForAPI } from '../utils/audio';
import { supabase } from '@/lib/supabase';

export const useRealtimeChat = () => {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);

  useEffect(() => {
    audioQueueRef.current = new AudioQueue();
    
    return () => {
      wsRef.current?.close();
      recorderRef.current?.stop();
    };
  }, []);

  const connect = useCallback(async () => {
    try {
      wsRef.current = new WebSocket(
        `wss://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.functions.supabase.co/realtime-chat`
      );

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('Received message:', data);
        
        if (data.type === 'response.audio.delta') {
          setIsSpeaking(true);
          const audioData = new Uint8Array(
            atob(data.delta).split('').map(c => c.charCodeAt(0))
          );
          await audioQueueRef.current?.addToQueue(audioData);
        }
        else if (data.type === 'response.audio.done') {
          setIsSpeaking(false);
        }
        else if (data.type === 'response.audio_transcript.delta') {
          setMessages(prev => [...prev, { text: data.delta, isUser: false }]);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Connection error:', error);
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      await connect();
    }

    recorderRef.current = new AudioRecorder((audioData) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'input_audio_buffer.append',
          audio: encodeAudioForAPI(audioData)
        }));
      }
    });

    await recorderRef.current.start();
    setIsRecording(true);
  }, [connect]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    setIsRecording(false);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'response.create' }));
    }
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text }]
        }
      }));
      
      setMessages(prev => [...prev, { text, isUser: true }]);
      wsRef.current.send(JSON.stringify({ type: 'response.create' }));
    }
  }, []);

  return {
    messages,
    isConnected,
    isRecording,
    isSpeaking,
    startRecording,
    stopRecording,
    sendMessage,
    connect
  };
};
