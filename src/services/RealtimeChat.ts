
import { supabase } from '@/lib/supabase';
import { AudioManager } from './audio/AudioManager';
import { WebRTCManager } from './webrtc/WebRTCManager';
import { SessionManager, UserInfo } from './session/SessionManager';

export class RealtimeChat {
  private webrtc: WebRTCManager;
  private audio: AudioManager;
  private session: SessionManager;
  private isDisconnected: boolean = false;

  constructor(private onMessage: (message: any) => void) {
    this.webrtc = new WebRTCManager();
    this.audio = new AudioManager();
    this.session = new SessionManager((event) => {
      if (this.webrtc.getDataChannel()?.readyState === 'open' && !this.isDisconnected) {
        try {
          console.log('Sending session event:', event);
          this.webrtc.getDataChannel()?.send(JSON.stringify(event));
        } catch (error) {
          console.error('Error sending session event:', error);
        }
      }
    });
  }

  setUserInfo(info: UserInfo) {
    this.session.setUserInfo(info);
  }

  async init() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: userData, error: profileError } = await supabase
        .from('profiles')
        .select('username, first_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      }

      const { data: userProgress, error: progressError } = await supabase
        .from('user_progress')
        .select('word')
        .eq('user_id', user.id)
        .eq('learned', true);

      if (progressError) {
        console.error('Error fetching learned words:', progressError);
      }

      const learnedWords = userProgress?.map(p => p.word) || [];
      console.log("Fetched learned words:", learnedWords);

      this.session.setUserInfo({
        nickname: userData?.first_name || userData?.username || 'friend',
        level: 'A1',
        learnedWords: learnedWords
      });

      const { data, error } = await supabase.functions.invoke("realtime-chat");
      
      if (error || !data.client_secret?.value) {
        throw new Error("Failed to get ephemeral token");
      }

      const EPHEMERAL_KEY = data.client_secret.value;

      const pc = await this.webrtc.createConnection();
      
      pc.ontrack = e => this.audio.setAudioStream(e.streams[0]);
      
      pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState);
        if (pc.connectionState === 'connected' && !this.isDisconnected) {
          console.log("Connection established, updating session settings...");
          setTimeout(() => {
            this.session.updateSessionSettings();
          }, 100); // Daha hızlı başlatmak için süreyi düşürdük
        }
      };

      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      await this.webrtc.addTrack(ms.getTracks()[0]);

      await this.webrtc.setupDataChannel((event) => {
        if (this.isDisconnected) return;

        try {
          console.log("Received event:", event);
          if (event.type === 'speech.transcription') {
            this.onMessage({
              type: 'input_text_transcribed',
              text: event.transcription
            });
          } else if (event.type === 'session.created') {
            console.log("Session created, updating settings...");
            this.session.updateSessionSettings();
          } else {
            this.onMessage(event);
          }
        } catch (error) {
          console.error('Error processing event:', error);
        }
      });

      const offer = await this.webrtc.createOffer();
      
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
      
      await this.webrtc.setRemoteDescription(answer);
      console.log("WebRTC connection established");

    } catch (error) {
      console.error("Error initializing chat:", error);
      throw error;
    }
  }

  setAudioDataHandler(handler: (data: Float32Array) => void) {
    this.audio.setAudioDataHandler(handler);
  }

  startRecording() {
    if (!this.isDisconnected) {
      this.audio.startRecording();
    }
  }

  stopRecording() {
    this.audio.stopRecording();
  }

  async sendMessage(text: string) {
    if (this.isDisconnected) return;
    
    if (!this.webrtc.getDataChannel() || this.webrtc.getDataChannel()?.readyState !== 'open') {
      throw new Error('Data channel not ready');
    }

    try {
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

      this.webrtc.getDataChannel()?.send(JSON.stringify(event));
      await new Promise(resolve => setTimeout(resolve, 100));
      this.webrtc.getDataChannel()?.send(JSON.stringify({type: 'response.create'}));
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  setSpeakingSpeed(slow: boolean) {
    if (!this.isDisconnected) {
      this.session.setSpeakingSpeed(slow);
    }
  }

  disconnect() {
    console.log("Disconnecting chat...");
    this.isDisconnected = true;
    
    // Kaydı durdur
    this.stopRecording();
    
    // Audio ve WebRTC bağlantılarını temizle
    this.audio.cleanup();
    this.webrtc.cleanup();
    
    // WebRTC bağlantısını zorla kapat
    const dataChannel = this.webrtc.getDataChannel();
    if (dataChannel) {
      console.log("Closing data channel...");
      dataChannel.close();
    }
    
    const peerConnection = this.webrtc.getPeerConnection();
    if (peerConnection) {
      console.log("Closing peer connection...");
      peerConnection.close();
    }

    // Medya akışlarını durdur
    if (this.webrtc.getPeerConnection()) {
      const senders = this.webrtc.getPeerConnection()?.getSenders();
      senders?.forEach(sender => {
        if (sender.track) {
          sender.track.stop();
        }
      });
    }
  }
}
