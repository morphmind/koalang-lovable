
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
        instructions: `You are chatting with ${this.userInfo.nickname || 'a friend'}. Be warm, friendly and natural in conversation.

Conversation flow:
1. Start by greeting warmly using their name (${this.userInfo.nickname})
2. Introduce yourself as Koaly (just say "I'm Koaly")
3. Ask how they are doing today
4. Based on their response, engage naturally
5. Let them lead the conversation direction

Keep in mind:
- Their English level is ${this.userInfo.level || 'unknown'}
- They know these words: ${this.userInfo.learnedWords?.join(', ') || 'No words learned yet'}
- Stay natural and conversational throughout
- Be encouraging but not too teacher-like
- Follow their conversation interests
- Remember context from earlier messages

${this.speakingSlow ? 'Speak slowly and clearly with pauses between words.' : 'Speak at a natural conversational pace.'}`,
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
