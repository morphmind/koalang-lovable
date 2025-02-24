
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
    this.updateSessionSettings();
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
        instructions: `CRITICAL INSTRUCTIONS - FOLLOW EXACTLY:

1. Your initial message MUST be EXACTLY:
"Hi ${nickname}! I'm Koaly, your English practice buddy. How are you today?"

2. All subsequent responses MUST:
- Use ONLY English (no other languages)
- Match their level (${level})
- Use simple clear language
- Focus on these specific learned words: ${learnedWords.join(', ')}
- Actively use their known words in each response
- Be encouraging and conversational
- Ask follow-up questions to keep the conversation going

${this.speakingSlow ? 'SPEAK SLOWLY with clear pauses between words.' : 'Use a natural conversational pace.'}

Audio settings:
- Always transcribe speech to text
- Reply to all messages whether spoken or typed
- Wait for user response after speaking
- Only instruct if they ask for help
- If user is quiet, gently encourage them to speak
- Try to use at least one word they know in each response`,
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
