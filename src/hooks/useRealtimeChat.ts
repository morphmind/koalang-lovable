import { useState, useEffect, useCallback, useRef } from 'react';
import { AudioRecorder, AudioQueue, encodeAudioForAPI } from '../utils/audio';

export const useRealtimeChat = () => {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectAttempts, setConnectAttempts] = useState(0);
  const MAX_CONNECT_ATTEMPTS = 3;

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

  const [pollingActive, setPollingActive] = useState(false);
  const pollingTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(async () => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('WebSocket zaten bağlı');
        return;
      }

      if (connectAttempts >= MAX_CONNECT_ATTEMPTS) {
        console.error('Maksimum bağlantı deneme sayısına ulaşıldı');
        return;
      }

      console.log('WebSocket bağlantısı kuruluyor...');
      const wsUrl = new URL('/realtime-chat', 'wss://scrnefzlozfshqwbjvst.functions.supabase.co');
      
      // Önceki bağlantıyı temizle
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Yeni bağlantı oluştur
      const ws = new WebSocket(wsUrl.toString());
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket bağlantısı başarılı');
        setIsConnected(true);
        setConnectAttempts(0);

        // Kullanıcının bildiği kelimeleri gönder
        ws.send(JSON.stringify({
          type: 'init.user.context',
          knownWords: ['merhaba', 'nasılsın', 'iyiyim', 'teşekkür', 'güle güle'],
          currentTopic: 'tanışma'
        }));
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Alınan mesaj:', data);

          if (data.type === 'connection.established') {
            console.log('Bağlantı kuruldu:', data.clientId);
            return;
          }

          if (data.type === 'response.audio.delta') {
            setIsSpeaking(true);
            const audioData = new Uint8Array(
              atob(data.delta).split('').map(c => c.charCodeAt(0))
            );
            await audioQueueRef.current?.addToQueue(audioData);
          } else if (data.type === 'response.audio.done') {
            setIsSpeaking(false);
          } else if (data.type === 'response.audio_transcript.delta') {
            setMessages(prev => [...prev, { text: data.delta, isUser: false }]);
            // Text-to-Speech isteği gönder
            if (data.delta) {
              ws.send(JSON.stringify({
                type: 'response.audio.generate',
                text: data.delta
              }));
            }
          } else if (data.type === 'error') {
            console.error('WebSocket hatası:', data.message);
          }
        } catch (error) {
          console.error('Mesaj işleme hatası:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket bağlantısı kapandı:', event);
        setIsConnected(false);

        if (event.code !== 1000 && connectAttempts < MAX_CONNECT_ATTEMPTS) {
          setConnectAttempts(prev => prev + 1);
          setTimeout(() => {
            console.log('Yeniden bağlanmaya çalışılıyor...');
            connect();
          }, 2000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket hatası:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Bağlantı hatası:', error);
      setConnectAttempts(prev => prev + 1);
    }
  }, [connectAttempts]);

  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
      setPollingActive(false);
      setIsConnected(false);
    };
  }, []);

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
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [connect]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      setIsRecording(false);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'response.create' }));
      }
    }
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket bağlı değil');
      return;
    }
    console.log('Mesaj gönderiliyor:', text);
    wsRef.current.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        content: [{ text }]
      }
    }));
    setMessages(prev => [...prev, { text, isUser: true }]);
  }, []);

  return {
    messages,
    isConnected,
    isRecording,
    isSpeaking,
    startRecording,
    stopRecording,
    sendMessage,
    connect,
  };
};
