
export interface UserInfo {
  nickname?: string;
  level?: string;
  learnedWords?: string[];
}

export class SessionManager {
  private userInfo: UserInfo = {};
  private speakingSlow: boolean = true;

  constructor(private sendEvent: (event: any) => void) {}

  setUserInfo(info: UserInfo) {
    this.userInfo = info;
    this.updateSessionSettings();
  }

  setSpeakingSpeed(slow: boolean) {
    this.speakingSlow = slow;
    this.updateSessionSettings();
  }

  updateSessionSettings() {
    console.log("Updating session settings with user info:", this.userInfo);
    
    const settings = {
      type: 'session.update',
      session: {
        modalities: ["text", "audio"],
        voice: "alloy",
        output_audio_format: "pcm16",
        input_audio_format: "pcm16",
        instructions: `You are chatting with ${this.userInfo.nickname || 'a friend'}. Always start by greeting them by name and introducing yourself.

First message flow:
1. Always start with: "Hello ${this.userInfo.nickname || 'friend'}! I'm Koaly, and I'll help you practice your English."
2. Then ask how they are doing today
3. Based on their response, engage naturally

Keep in mind:
- Their English level is ${this.userInfo.level || 'unknown'}
- They have learned these words: ${this.userInfo.learnedWords?.join(', ') || 'No words learned yet'}
- Use the words they've learned when possible
- Stay natural and conversational throughout
- Be encouraging but not too teacher-like
- Remember context from earlier messages

${this.speakingSlow ? 'Speak slowly and clearly with pauses between words.' : 'Speak at a natural conversational pace.'}

Important:
- Every time user speaks, transcribe their speech to text and share it as a message
- Reply to every user message, whether it's spoken or typed
- Wait for user response after each of your messages
- Don't give any instructions or say "repeat after me" unless user asks for it
- Actively use their learned vocabulary in your responses
- When there's a long pause, encourage them to speak more`,
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 1000
        }
      }
    };

    this.sendEvent(settings);
  }
}

