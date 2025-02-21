
import { useState, useEffect, useCallback, useRef } from 'react';
import { AudioRecorder, AudioQueue, encodeAudioForAPI } from '../utils/audio';
import { toast } from 'react-hot-toast';

export const useRealtimeChat = () => {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectAttempts, setConnectAttempts] = useState(0);
  const MAX_CONNECT_ATTEMPTS = 3;
  const RECONNECT_DELAY = 2000;

  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);

  useEffect(() => {
    audioQueueRef.current = new AudioQueue();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (recorderRef.current) {
        recorderRef.current.stop();
        recorderRef.current = null;
      }
    };
  }, []);

  const connect = useCallback(async () => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected');
        return;
      }

      if (connectAttempts >= MAX_CONNECT_ATTEMPTS) {
        console.error('Max connection attempts reached');
        toast.error('Bağlantı kurulamadı. Lütfen sayfayı yenileyip tekrar deneyin.');
        return;
      }

      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/functions/v1/realtime-chat`;
      console.log('Connecting to:', wsUrl);
      
      if (wsRef.current) {
        wsRef.current.close();
      }

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setConnectAttempts(0);
        toast.success('Bağlantı kuruldu!');
      };

      wsRef.current.onmessage = async (event) => {
        try {
          console.log('Raw message received:', event.data);
          const data = JSON.parse(event.data);
          console.log('Parsed message:', data);

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
          else if (data.type === 'error') {
            console.error('WebSocket error:', data.message);
            toast.error('Bir hata oluştu: ' + data.message);
          }
        } catch (error) {
          console.error('Error processing message:', error);
          toast.error('Mesaj işlenirken bir hata oluştu');
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event);
        setIsConnected(false);
        wsRef.current = null;
        
        if (event.code !== 1000 && connectAttempts < MAX_CONNECT_ATTEMPTS) {
          console.log('Attempting to reconnect...');
          toast.loading('Yeniden bağlanılıyor...');
          setConnectAttempts(prev => prev + 1);
          setTimeout(() => connect(), RECONNECT_DELAY);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        toast.error('Bağlantı hatası oluştu');
      };

    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Bağlantı hatası: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      setConnectAttempts(prev => prev + 1);
      if (connectAttempts < MAX_CONNECT_ATTEMPTS) {
        setTimeout(() => connect(), RECONNECT_DELAY);
      }
    }
  }, [connectAttempts]);

  const startRecording = useCallback(async () => {
    try {
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
      toast.success('Kayıt başladı');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Kayıt başlatılırken bir hata oluştu');
    }
  }, [connect]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
      setIsRecording(false);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'response.create' }));
      }
      toast.success('Kayıt durduruldu');
    }
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      toast.error('Bağlantı yok');
      return;
    }

    console.log('Sending message:', text);
    
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
