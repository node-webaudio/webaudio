import {
  AudioContext,
  IAudioContext,
  IAnalyserNode,
  IMediaStreamAudioSourceNode
} from 'standardized-audio-context';
import EventEmitter from 'events';

export type AudioKind = 'videoinput' | 'audioinput';

export type AnalyzerOptions = {
  fftSize: number;
  smoothingTimeConstant: number;
};

export class WebAudioCore {
  context: IAudioContext;
  analyzer: IAnalyserNode<AudioContext>;
  source: IMediaStreamAudioSourceNode<AudioContext>;
  events = new EventEmitter();
  private updateHandle: number = null;
  connected = false;
  listening = false;

  constructor(context: IAudioContext = new AudioContext()) {
    this.context = context;
    this.update = this.update.bind(this);
  }

  static async getSources(kind: AudioKind = 'audioinput') {
    try {
      await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      const sources = await navigator.mediaDevices.enumerateDevices();

      return sources.filter((source) => source.kind === kind);
    } catch (error) {
      return [];
    }
  }

  async connect(deviceInfo: MediaDeviceInfo) {
    if (this.connected) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceInfo.deviceId
      }
    });

    this.source = this.context.createMediaStreamSource(stream);
    this.analyzer = this.context.createAnalyser();
    this.connected = true;
  }

  disconnect() {
    if (!this.connected) {
      return;
    }

    this.stopListening();
    this.source = null;
    this.analyzer = null;
    this.connected = false;
  }

  listen(analyzerOptions?: AnalyzerOptions) {
    if (this.listening) {
      return;
    }

    this.analyzer.smoothingTimeConstant =
      analyzerOptions?.smoothingTimeConstant ?? 0.8;
    this.analyzer.fftSize = analyzerOptions?.fftSize ?? 4096;

    this.source.connect(this.analyzer);
    this.updateHandle = requestAnimationFrame(this.update);

    this.listening = true;
  }

  stopListening() {
    if (!this.listening) {
      return;
    }

    this.source.disconnect(this.analyzer);
    if (this.updateHandle !== null) {
      cancelAnimationFrame(this.updateHandle);
      this.updateHandle = null;
    }

    this.listening = false;
  }

  update() {
    if (!this.connected || !this.listening) {
      return;
    }

    if (this.events.eventNames().includes('volume')) {
      const sample = new Uint8Array(1);
      this.analyzer.getByteFrequencyData(sample);

      const value = sample[0];
      const percent = value / 255;
      const decibels =
        this.analyzer.minDecibels +
        (this.analyzer.maxDecibels - this.analyzer.minDecibels) * percent;

      this.events.emit('volume', {
        decibels: decibels + -this.analyzer.minDecibels,
        raw: value
      });
    }

    if (this.events.eventNames().includes('spectrum')) {
      const timeSeries = new Uint8Array(this.analyzer.fftSize / 2);

      this.analyzer.getByteTimeDomainData(timeSeries);
      this.events.emit('spectrum', {
        data: timeSeries
      });
    }

    this.updateHandle = requestAnimationFrame(this.update);
  }
}
