
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
      // Kullanıcı konuşmaya başladığında geçici mesaj oluştur
      setMessages(prev => [...prev, { text: '...', isUser: true }]);
    } else if (event.type === 'speech_stopped') {
      // Geçici mesajı kaldır
      setMessages(prev => prev.filter(msg => msg.text !== '...'));
    } else if (event.type === 'input_text_transcribed' && event.text) {
      console.log('Setting user message:', event.text);
      setMessages(prev => [...prev.filter(msg => msg.text !== '...'), { text: event.text, isUser: true }]);
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

      const { data: userData } = await supabase
        .from('profiles')
        .select('username')
        .single();

      const { data: userProgress } = await supabase
        .from('user_progress')
        .select('word')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('learned', true);

      chatRef.current = new RealtimeChat(handleMessage);
      
      chatRef.current.setUserInfo({
        nickname: userData?.username || 'friend',
        level: 'A1',
        learnedWords: userProgress?.map(p => p.word) || []
      });
      
      await chatRef.current.init();
      setIsConnected(true);
      
      toast({
        title: "Bağlantı başarılı",
        description: "Koaly ile konuşmaya başlayabilirsiniz",
      });

      audioQueueRef.current = new AudioQueue();
    } catch (error) {
      console.error('Bağlantı hatası:', error);
      toast({
        title: "Bağlantı hatası",
        description: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu',
        variant: "destructive",
      });
    }
  }, [handleMessage, toast]);

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
      toast({
        title: "Kayıt hatası",
        description: "Ses kaydı başlatılamadı",
        variant: "destructive",
      });
    }
  }, [connect, toast]);

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
        toast({
          title: newValue ? "Yavaş konuşma modu açık" : "Normal konuşma modu açık",
          description: newValue ? "Koaly daha yavaş konuşacak" : "Koaly normal hızda konuşacak",
        });
      }
      return newValue;
    });
  }, [toast]);

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
