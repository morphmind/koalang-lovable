
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
    console.log("Setting user info:", info);
    this.userInfo = info;
  }

  setSpeakingSpeed(slow: boolean) {
    this.speakingSlow = slow;
    this.updateSessionSettings();
  }

  updateSessionSettings() {
    const nickname = this.userInfo.nickname || 'friend';
    const level = this.userInfo.level || 'A1';
    const learnedWords = this.userInfo.learnedWords || [];

    console.log("Updating session with:", {
      nickname,
      level,
      learnedWords
    });
    
    const settings = {
      type: 'session.update',
      session: {
        modalities: ["text", "audio"],
        voice: "alloy",
        output_audio_format: "pcm16",
        input_audio_format: "pcm16",
        instructions: `You MUST start by saying exactly: "Hi ${nickname}! I'm Koaly, your English practice buddy. How are you today?"

After that, for all responses:
- Use only English
- Match their level (${level})
- Use simple clear language
- Focus on using these known words: ${learnedWords.join(', ')}
- Be friendly and encouraging
- Always ask questions to keep the conversation going

${this.speakingSlow ? 'Speak slowly and clearly with pauses between words.' : 'Use a natural conversational pace.'}

Voice settings:
- Transcribe all speech
- Reply promptly
- Wait for user response
- Only instruct when asked
- Encourage speaking practice`,
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 1000,
          create_response: true,
          interrupt_response: true
        }
      }
    };

    this.sendEvent(settings);
  }
}
