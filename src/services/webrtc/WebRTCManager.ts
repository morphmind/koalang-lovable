
export class WebRTCManager {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  
  async createConnection() {
    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    return this.pc;
  }

  async setupDataChannel(onMessage: (event: any) => void) {
    if (!this.pc) throw new Error('Connection not initialized');
    
    this.dc = this.pc.createDataChannel("oai-events");
    this.dc.addEventListener("message", (e) => {
      if (typeof e.data !== 'string') {
        console.error('Received invalid message data:', e.data);
        return;
      }
      
      try {
        const event = JSON.parse(e.data);
        console.log("Received event:", event);

        if (event.type === 'speech.transcription') {
          onMessage(event);
          return;
        }

        if (event.type === 'conversation.item' && event.item.role === 'assistant') {
          const transcript = event.item.content
            .filter((c: any) => c.type === 'text')
            .map((c: any) => c.text)
            .join(' ');

          if (transcript) {
            onMessage({
              type: 'response.text',
              text: transcript
            });
          }
          return;
        }

        if (event.type === 'response.audio_transcript.delta' && event.delta) {
          onMessage(event);
          return;
        }

        onMessage(event);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
    return this.dc;
  }

  async createOffer() {
    if (!this.pc) throw new Error('Connection not initialized');
    
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    return offer;
  }

  async setRemoteDescription(answer: RTCSessionDescriptionInit) {
    if (!this.pc) throw new Error('Connection not initialized');
    await this.pc.setRemoteDescription(answer);
  }

  getDataChannel() {
    return this.dc;
  }

  getPeerConnection() {
    return this.pc;
  }

  cleanup() {
    if (this.dc) {
      console.log("Cleaning up data channel...");
      this.dc.close();
      this.dc = null;
    }
    
    if (this.pc) {
      console.log("Cleaning up peer connection...");
      try {
        const senders = this.pc.getSenders();
        senders.forEach(sender => {
          if (sender.track) {
            sender.track.stop();
          }
        });
      } catch (error) {
        console.error("Error stopping senders:", error);
      }
      this.pc.close();
      this.pc = null;
    }
  }
}
