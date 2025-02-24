
import { supabase } from '@/lib/supabase';
import { AudioRecorder } from '../utils/audio';

export class RealtimeChat {
  private pc: RTCPeerConnection | null = null;
  dc: RTCDataChannel | null = null;
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
          ? `You are Koaly, a friendly English conversation partner. ${userContext} 
             Treat this as a natural conversation between two friends. Always listen carefully to what the user says and respond appropriately to the context.
             When they say "Hi" or "Hello", greet them warmly like a friend would. Never ask if they want to practice English right after a greeting - that's not natural.
             Keep the conversation flowing naturally by asking relevant follow-up questions based on their responses.
             Speak very slowly and clearly, with pauses between words. Use vocabulary from their learned words list when possible.
             Remember previous context in the conversation and refer back to it naturally. Never break character or mention being an AI.`
          : `You are Koaly, a friendly English conversation partner. ${userContext}
             Treat this as a natural conversation between two friends. Always listen carefully to what the user says and respond appropriately to the context.
             Keep the conversation flowing naturally by asking relevant follow-up questions based on their responses.
             Remember previous context in the conversation and refer back to it naturally. Never break character or mention being an AI.`,
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
            text: 'Start conversation'
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
