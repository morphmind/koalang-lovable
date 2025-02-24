
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
        instructions: `You are having a casual conversation with the user. Act naturally like a friend chatting over the phone. ${userContext}

Key behaviors:
- Be warm, friendly and engaging - like talking to a good friend
- Listen actively and respond naturally to what the user says
- Ask casual follow-up questions to keep the conversation flowing
- Let the conversation develop organically based on the user's interests
- Share your own thoughts and experiences (within reason)
- Use natural conversational English, not textbook English
- Keep responses brief and conversational, like in a real chat
- Remember previous context and refer back naturally
- Never break character or mention being AI
- Never give language lessons unless explicitly asked

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

  sendInitialMessage() {
    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: 'Hi!'
          }
        ]
      }
    };

    this.sendEvent(event);
    this.sendEvent({type: 'response.create'});
  }
}
