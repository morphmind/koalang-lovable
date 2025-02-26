import { AudioWorklet } from 'standardized-audio-context';

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      // AudioWorklet modülünü yükle
      await this.audioContext.audioWorklet.addModule('/audio-processors/audio-processor.js');
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      
      // AudioWorkletNode oluştur
      this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-recorder-processor', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        processorOptions: {
          bufferSize: 4096
        }
      });
      
      // Ses verisi işlendiğinde bizim callback'imizi çağır
      this.workletNode.port.onmessage = (event) => {
        if (event.data.type === 'audio-data') {
          this.onAudioData(event.data.audioData);
        }
      };
      
      // Bağlantıları kur
      this.source.connect(this.workletNode);
      this.workletNode.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Mikrofona erişirken hata:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export class AudioQueue {
  private audioContext: AudioContext;
  private audioWorkletNode: AudioWorkletProcessor | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private queue: Uint8Array[] = [];
  private isPlaying: boolean = false;
  private playbackRate: number = 1.0;

  constructor() {
    this.audioContext = new AudioContext();
    this.initAudioWorklet();
  }

  private async initAudioWorklet() {
    try {
      // AudioWorklet modülünü yükle
      await this.audioContext.audioWorklet.addModule('/audio-processors/audio-processor.js');
      
      // AudioWorkletNode'u oluştur
      this.audioWorkletNode = new AudioWorkletNode(this.audioContext, 'audio-processor');
      this.audioWorkletNode.connect(this.audioContext.destination);
      
      // Mesaj dinleyicisi ekle
      this.audioWorkletNode.port.onmessage = (event) => {
        if (event.data.type === 'processingComplete') {
          this.processNextInQueue();
        }
      };
    } catch (error) {
      console.error('AudioWorklet yüklenemedi:', error);
    }
  }

  public addToQueue(audioData: Uint8Array) {
    this.queue.push(audioData);
    if (!this.isPlaying) {
      this.processNextInQueue();
    }
  }

  private async processNextInQueue() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;
    
    try {
      // AudioBuffer oluştur
      const audioBuffer = await this.audioContext.decodeAudioData(audioData.buffer);
      
      // Kaynak düğümü oluştur
      this.sourceNode = this.audioContext.createBufferSource();
      this.sourceNode.buffer = audioBuffer;
      this.sourceNode.playbackRate.value = this.playbackRate;
      
      // AudioWorkletNode'a bağla
      this.sourceNode.connect(this.audioWorkletNode!);
      
      // Çalmayı başlat
      this.sourceNode.start();
      this.sourceNode.onended = () => {
        this.processNextInQueue();
      };
    } catch (error) {
      console.error('Ses işleme hatası:', error);
      this.processNextInQueue();
    }
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    if (this.sourceNode) {
      this.sourceNode.playbackRate.value = rate;
    }
  }
}

export const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};
