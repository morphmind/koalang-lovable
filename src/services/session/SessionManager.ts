
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
    
    const userContext = `User's name is ${this.userInfo.nickname}. Their English level is ${this.userInfo.level || 'unknown'}. ${
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
        instructions: `You are having a natural conversation with ${this.userInfo.nickname}. Act like a friendly tutor who helps them practice English. Never mention being AI.

Key behaviors:
- Start by warmly greeting them by name and introducing yourself briefly as Koaly, the Koalang mascot
- After greeting, naturally ask how they are doing today and engage based on their response
- Let them decide the direction of the conversation - they might want to practice with learned words or have a general conversation
- If they want to practice with learned words, use words from their vocabulary: ${this.userInfo.learnedWords?.join(', ')}
- Maintain a natural, friendly conversation flow like two people chatting
- Adapt to their English level (${this.userInfo.level}) but encourage them to improve
- Keep responses conversational and engaging
- Remember context from earlier in the conversation
- If they want to change the topic or style of practice, be flexible and adapt

${this.speakingSlow ? 'Speak very slowly and clearly, with pauses between words.' : 'Speak at a normal conversational pace.'}`,
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
