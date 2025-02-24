
import { supabase } from '@/lib/supabase';
import { AudioManager } from './audio/AudioManager';
import { WebRTCManager } from './webrtc/WebRTCManager';
import { SessionManager, UserInfo } from './session/SessionManager';

export class RealtimeChat {
  private webrtc: WebRTCManager;
  private audio: AudioManager;
  private session: SessionManager;
  private speakingSlow: boolean = true;

  constructor(private onMessage: (message: any) => void) {
    this.webrtc = new WebRTCManager();
    this.audio = new AudioManager();
    this.session = new SessionManager((event) => {
      this.webrtc.getDataChannel()?.send(JSON.stringify(event));
    });
  }

  setUserInfo(info: UserInfo) {
    this.session.setUserInfo(info);
  }

  async init() {
    try {
      // Kullanıcı bilgilerini al
      const { data: userData } = await supabase
        .from('profiles')
        .select('username, first_name')
        .single();

      // Öğrenilen kelimeleri al
      const { data: userProgress } = await supabase
        .from('user_progress')
        .select('word')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('learned', true);

      const learnedWords = userProgress?.map(p => p.word) || [];
      
      this.session.setUserInfo({
        nickname: userData?.username || 'friend',
        level: 'A1', // Bu değeri veritabanından alabilirsiniz
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
      };

      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      await this.webrtc.addTrack(ms.getTracks()[0]);

      await this.webrtc.setupDataChannel(this.onMessage);

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

      await new Promise(resolve => setTimeout(resolve, 1000));
      this.session.updateSessionSettings();

    } catch (error) {
      console.error("Error initializing chat:", error);
      throw error;
    }
  }

  setAudioDataHandler(handler: (data: Float32Array) => void) {
    this.audio.setAudioDataHandler(handler);
  }

  startRecording() {
    this.audio.startRecording();
  }

  stopRecording() {
    this.audio.stopRecording();
  }

  async sendMessage(text: string) {
    const dc = this.webrtc.getDataChannel();
    if (!dc || dc.readyState !== 'open') {
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

    dc.send(JSON.stringify(event));
    await new Promise(resolve => setTimeout(resolve, 100));
    dc.send(JSON.stringify({type: 'response.create'}));
  }

  setSpeakingSpeed(slow: boolean) {
    this.speakingSlow = slow;
    this.session.setSpeakingSpeed(slow);
  }

  disconnect() {
    console.log("Disconnecting chat...");
    this.audio.cleanup();
    this.webrtc.cleanup();
  }
}
