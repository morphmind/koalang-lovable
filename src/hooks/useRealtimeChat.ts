
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
      
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      const ws = new WebSocket(wsUrl.toString());
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket bağlantısı başarılı');
        setIsConnected(true);
        setConnectAttempts(0);
        
        // Bağlantı kurulduktan sonra session.update olayını gönder
        ws.send(JSON.stringify({
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: "Sen İngilizce öğrenmeme yardımcı olan Koaly'sin. Konuşmaya başladığımızda bana selamlar ver ve hal hatır sor. Daha sonra bir İngilizce pratik yapmayı öner. Konuşma sırasında basit cümleler kur ve benim tekrar etmemi iste. Telaffuzumla ilgili geri bildirim ver.",
            voice: "alloy",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1",
              suppress_tokens: []
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            tool_choice: "auto",
            temperature: 0.8,
            max_response_output_tokens: "inf"
          }   
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
      console.error('Kayıt başlatma hatası:', error);
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
