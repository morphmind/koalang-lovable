
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { RealtimeChat } from '../services/RealtimeChat';
import { AudioQueue } from '../utils/audio';
import { encodeAudioForAPI } from '../utils/audioEncoder';

export const useRealtimeChat = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeakingSlow, setIsSpeakingSlow] = useState(true);
  const chatRef = useRef<RealtimeChat | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const currentMessageRef = useRef<{ text: string; isUser: boolean } | null>(null);

  const handleMessage = useCallback((event: any) => {
    console.log('Received message:', event);
    
    if (event.type === 'response.audio.delta') {
      setIsSpeaking(true);
      const audioData = new Uint8Array(
        atob(event.delta).split('').map(c => c.charCodeAt(0))
      );
      audioQueueRef.current?.addToQueue(audioData);
    } else if (event.type === 'response.audio.done') {
      setIsSpeaking(false);
      currentMessageRef.current = null;
    } else if (event.type === 'speech_started') {
      setMessages(prev => {
        // Remove any existing temporary messages
        const filtered = prev.filter(msg => msg.text !== '...');
        return [...filtered, { text: '...', isUser: true }];
      });
    } else if (event.type === 'speech_stopped') {
      setMessages(prev => prev.filter(msg => msg.text !== '...'));
    } else if (event.type === 'input_text_transcribed' && event.text) {
      console.log('Setting user message:', event.text);
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.text !== '...');
        return [...filtered, { text: event.text, isUser: true }];
      });
      currentMessageRef.current = { text: event.text, isUser: true };
    } else if (event.type === 'response.audio_transcript.delta' && event.delta) {
      setMessages(prev => {
        if (!currentMessageRef.current || currentMessageRef.current.isUser) {
          const newMessage = { text: event.delta, isUser: false };
          currentMessageRef.current = newMessage;
          return [...prev, newMessage];
        } else {
          const lastMessage = prev[prev.length - 1];
          const updatedMessages = prev.slice(0, -1);
          return [...updatedMessages, { 
            ...lastMessage, 
            text: lastMessage.text + event.delta 
          }];
        }
      });
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      if (chatRef.current) {
        return;
      }

      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      setIsConnected(true);
      
      audioQueueRef.current = new AudioQueue();
    } catch (error) {
      console.error('Bağlantı hatası:', error);
      throw error;
    }
  }, [handleMessage]);

  const startRecording = useCallback(async () => {
    try {
      if (!chatRef.current) {
        await connect();
      }

      chatRef.current?.setAudioDataHandler((audioData) => {
        if (chatRef.current?.dc?.readyState === 'open') {
          chatRef.current.dc.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodeAudioForAPI(audioData)
          }));
        }
      });

      chatRef.current?.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Kayıt başlatma hatası:', error);
      throw error;
    }
  }, [connect]);

  const stopRecording = useCallback(() => {
    chatRef.current?.stopRecording();
    setIsRecording(false);
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!chatRef.current) {
      toast({
        title: "Bağlantı hatası",
        description: "Mesaj gönderilemedi, bağlantı kopuk",
        variant: "destructive",
      });
      return;
    }

    chatRef.current.sendMessage(text).catch(error => {
      console.error('Mesaj gönderme hatası:', error);
      toast({
        title: "Hata",
        description: "Mesaj gönderilemedi",
        variant: "destructive",
      });
    });

    setMessages(prev => [...prev, { text, isUser: true }]);
  }, [toast]);

  const toggleSpeakingSpeed = useCallback(() => {
    setIsSpeakingSlow(prev => {
      const newValue = !prev;
      if (chatRef.current) {
        chatRef.current.setSpeakingSpeed(newValue);
      }
      return newValue;
    });
  }, []);

  return {
    messages,
    isConnected,
    isRecording,
    isSpeaking,
    isSpeakingSlow,
    startRecording,
    stopRecording,
    sendMessage,
    connect,
    toggleSpeakingSpeed,
  };
};
