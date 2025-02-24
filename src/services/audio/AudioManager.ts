
import { AudioRecorder } from '../../utils/audio';

export class AudioManager {
  private audioEl: HTMLAudioElement;
  private recorder: AudioRecorder | null = null;
  private onAudioData: ((data: Float32Array) => void) | null = null;

  constructor() {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
  }

  setAudioDataHandler(handler: (data: Float32Array) => void) {
    this.onAudioData = handler;
  }

  startRecording() {
    if (this.onAudioData) {
      this.recorder = new AudioRecorder(this.onAudioData);
      this.recorder.start();
    }
  }

  stopRecording() {
    this.recorder?.stop();
    this.recorder = null;
  }

  setAudioStream(stream: MediaStream) {
    this.audioEl.srcObject = stream;
  }

  cleanup() {
    if (this.recorder) {
      this.recorder.stop();
      this.recorder = null;
    }
    
    if (this.audioEl.srcObject) {
      const mediaStream = this.audioEl.srcObject as MediaStream;
      mediaStream.getTracks().forEach(track => {
        track.stop();
      });
      this.audioEl.srcObject = null;
    }
    
    this.audioEl.remove();
  }
}
