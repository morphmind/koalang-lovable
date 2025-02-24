
import { useState, useEffect, useCallback, useRef } from 'react';
import { AudioRecorder, AudioQueue } from '../utils/audio';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

export class RealtimeChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;
  private recorder: AudioRecorder | null = null;
  private onAudioData: ((data: Float32Array) => void) | null = null;
  private speakingSlow: boolean = true;
  private isListening: boolean = false;
  private currentMessage: string = '';
  private transcriptionComplete: boolean = false;
  private userInfo: {
    nickname?: string;
    level?: string;
    learnedWords?: string[];
  } = {};

  constructor(private onMessage: (message: any) => void) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
  }

  setUserInfo(info: { nickname?: string; level?: string; learnedWords?: string[] }) {
    this.userInfo = info;
    if (this.dc?.readyState === 'open') {
      this.updateSessionSettings();
    }
  }

  async init() {
    try {
      const { data, error } = await supabase.functions.invoke("realtime-chat");
      
      if (error || !data.client_secret?.value) {
        throw new Error("Failed to get ephemeral token");
      }

      const EPHEMERAL_KEY = data.client_secret.value;

      this.pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      this.pc.ontrack = e => this.audioEl.srcObject = e.streams[0];
      this.pc.onconnectionstatechange = () => {
        console.log("Connection state:", this.pc?.connectionState);
      };

      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.pc.addTrack(ms.getTracks()[0]);

      this.dc = this.pc.createDataChannel("oai-events");
      this.dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        console.log("Received event:", event);
        
        if (event.type === 'speech_started') {
          this.isListening = true;
          this.transcriptionComplete = false;
          console.log('User started speaking');
        } else if (event.type === 'speech_stopped' && this.isListening) {
          this.isListening = false;
          this.transcriptionComplete = true;
          console.log('User stopped speaking');
          // Only send response.create if we have received some transcribed text
          if (this.currentMessage.trim().length > 0) {
            if (this.dc?.readyState === 'open') {
              this.dc.send(JSON.stringify({ type: 'response.create' }));
            }
          }
        } else if (event.type === 'input_text_transcribed') {
          this.currentMessage = event.text || '';
          console.log('Transcribed text:', this.currentMessage);
        }
        
        this.onMessage(event);
      });

      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`Failed to connect: ${sdpResponse.statusText}`);
      }

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await this.pc.setRemoteDescription(answer);
      console.log("WebRTC connection established");

      await new Promise(resolve => setTimeout(resolve, 1000));
      this.updateSessionSettings();
      await new Promise(resolve => setTimeout(resolve, 500));
      this.sendInitialMessage();
    } catch (error) {
      console.error("Error initializing chat:", error);
      throw error;
    }
  }

  private updateSessionSettings() {
    if (!this.dc || this.dc.readyState !== 'open') return;

    console.log("Updating session settings with user info:", this.userInfo);
    
    const userContext = `User's English level is ${this.userInfo.level || 'unknown'}. ${
      this.userInfo.learnedWords?.length 
        ? `They have learned these words: ${this.userInfo.learnedWords.join(', ')}.` 
        : 'They haven\'t learned any words yet.'
    }`;
    
    const settings = {
      type: 'session.update',
      session: {
        modalities: ["text", "audio"],
        voice: "alloy",
        output_audio_format: "pcm16",
        input_audio_format: "pcm16",
        instructions: this.speakingSlow 
          ? `You are an English practice partner. Your name is Koaly. ${userContext} The user's nickname is ${this.userInfo.nickname || 'unknown'}. Start by greeting them by their nickname and asking how they would like to be addressed during the conversation. Always speak very slowly and clearly, emphasizing each word individually with clear pauses between them. Focus on using vocabulary from their learned words list when possible, and keep the conversation at their level. Never say "Well done" or similar praise unless they've actually accomplished something specific. Maintain natural conversation flow.`
          : `You are an English practice partner. Your name is Koaly. ${userContext} Always be kind, patient and helpful. Focus on using vocabulary appropriate for their level. Maintain natural conversation flow.`,
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 1000
        }
      }
    };

    this.dc.send(JSON.stringify(settings));
  }

  private sendInitialMessage() {
    if (!this.dc || this.dc.readyState !== 'open') return;
    
    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `Hi Koaly!`
          }
        ]
      }
    };

    this.dc.send(JSON.stringify(event));
    this.dc.send(JSON.stringify({type: 'response.create'}));
  }

  setAudioDataHandler(handler: (data: Float32Array) => void) {
    this.onAudioData = handler;
  }

  startRecording() {
    if (this.onAudioData) {
      this.recorder = new AudioRecorder(this.onAudioData);
      this.recorder.start();
    }
  }

  stopRecording() {
    this.recorder?.stop();
    this.recorder = null;
  }

  async sendMessage(text: string) {
    if (!this.dc || this.dc.readyState !== 'open') {
      throw new Error('Data channel not ready');
    }

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text
          }
        ]
      }
    };

    this.dc.send(JSON.stringify(event));
    await new Promise(resolve => setTimeout(resolve, 100));
    this.dc.send(JSON.stringify({type: 'response.create'}));
  }

  setSpeakingSpeed(slow: boolean) {
    this.speakingSlow = slow;
    this.updateSessionSettings();
  }

  disconnect() {
    console.log("Disconnecting chat...");
    
    if (this.recorder) {
      console.log("Stopping recorder...");
      this.recorder.stop();
      this.recorder = null;
    }
    
    if (this.audioEl.srcObject) {
      console.log("Stopping audio tracks...");
      const mediaStream = this.audioEl.srcObject as MediaStream;
      mediaStream.getTracks().forEach(track => {
        track.stop();
        console.log("Stopped track:", track.kind);
      });
      this.audioEl.srcObject = null;
    }
    
    if (this.dc) {
      console.log("Closing data channel...");
      this.dc.close();
      this.dc = null;
    }
    
    if (this.pc) {
      console.log("Closing peer connection...");
      try {
        const senders = this.pc.getSenders();
        senders.forEach(sender => {
          if (sender.track) {
            sender.track.stop();
          }
        });
      } catch (error) {
        console.error("Error stopping senders:", error);
      }
      this.pc.close();
      this.pc = null;
    }

    this.audioEl.remove();
  }
}

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
    } else if (event.type === 'input_text_transcribed' && event.text) {
      console.log('Setting user message:', event.text);
      setMessages(prev => {
        const newMessage = { text: event.text, isUser: true };
        currentMessageRef.current = newMessage;
        return [...prev, newMessage];
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
      
      // Set user info before initializing
      chatRef.current.setUserInfo({
        nickname: userData?.username || 'friend',
        level: 'A1', // Get this from user's profile when available
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
          const encodedAudio = encodeAudioForAPI(audioData);
          chatRef.current.dc.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodedAudio
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

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
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

const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

