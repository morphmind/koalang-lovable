
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
    this.updateSessionSettings(); // Hemen güncelleme yap
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
        instructions: `CRITICAL INSTRUCTIONS - FOLLOW STRICTLY:

First message MUST BE EXACTLY:
"Hi ${nickname}! I'm Koaly, your English practice buddy. How are you today?"

For ALL responses:
- Use ONLY English (no other languages)
- Match their level (${level})
- Use simple clear language
- Focus on using these learned words: ${learnedWords.join(', ')}
- Be encouraging and conversational
- ALWAYS ask follow-up questions

${this.speakingSlow ? 'SPEAK SLOWLY with clear pauses between words.' : 'Use a natural conversational pace.'}

Audio settings:
- Always transcribe speech
- Reply to all messages promptly
- Wait for user response
- Only give instructions if asked
- Encourage speaking if user is quiet
- Try to use known words frequently`,
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
