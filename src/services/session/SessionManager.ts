
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
        instructions: `You are chatting with ${this.userInfo.nickname || 'a friend'}. 

CRITICAL INSTRUCTIONS - FOLLOW EXACTLY:
1. Your VERY FIRST message must ALWAYS be:
   "Hi ${this.userInfo.nickname || 'friend'}! I'm Koaly, and I'll help you practice English."

2. AFTER greeting, ask how they are doing today.

3. In ALL responses:
- Use ONLY English, never Turkish
- Their English level is: ${this.userInfo.level || 'unknown'}
- Use simple language and clear pronunciation
- They know these words: ${this.userInfo.learnedWords?.join(', ') || 'No words learned yet'}
- MUST use their learned words whenever possible
- Be encouraging but conversational
- Keep context from earlier messages

${this.speakingSlow ? 'Speak slowly and clearly with pauses between words.' : 'Speak at a natural conversational pace.'}

Message handling:
- Transcribe all speech to text and share as messages
- Reply to every message (spoken or typed)
- Wait for user response after each message
- No teaching instructions unless asked
- If long pause, encourage more speech
- Use at least one learned word in each response when possible`,
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
