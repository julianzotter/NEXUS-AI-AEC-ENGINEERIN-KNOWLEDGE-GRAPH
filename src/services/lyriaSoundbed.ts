/**
 * NEXUS-4 Lyria-Soundbed
 * Web Audio API D-Minor Ambient Generative Synthesizer
 * Provides atmospheric structural audio and real-time frequency analysis for Waveform Canvas.
 */

class LyriaSoundbed {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isPlaying = false;
  private lfo: OscillatorNode | null = null;

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioCtx();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.85;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.08, this.ctx.currentTime); // gentle background level

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  public start() {
    this.init();
    if (!this.ctx || this.isPlaying) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // D-Minor Root Chords (D2, A2, D3, F3, A3, C4)
    const chordFrequencies = [73.42, 110.00, 146.83, 174.61, 220.00, 261.63];

    // Filter for warm analog warmth
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(480, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.5, this.ctx.currentTime);
    filter.connect(this.masterGain!);

    // LFO modulation for breathing drone
    this.lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    this.lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 0.12 Hz slow breath
    lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
    this.lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    this.lfo.start();

    this.oscillators = [];
    chordFrequencies.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const oscGain = this.ctx!.createGain();

      // Alternate triangle and sine waves for smooth depth
      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      // Slight detune for lush chorus effect
      osc.frequency.setValueAtTime(freq + (idx * 0.18 - 0.4), this.ctx!.currentTime);

      const amp = 0.15 / (idx + 1);
      oscGain.gain.setValueAtTime(amp, this.ctx!.currentTime);

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      this.oscillators.push(osc);
    });

    this.isPlaying = true;
  }

  public stop() {
    if (!this.isPlaying) return;
    this.oscillators.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch (_) {}
    });
    this.oscillators = [];

    if (this.lfo) {
      try { this.lfo.stop(); this.lfo.disconnect(); } catch (_) {}
      this.lfo = null;
    }
    this.isPlaying = false;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getAudioContext(): AudioContext | null {
    return this.ctx;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }
}

export const lyriaSoundbed = new LyriaSoundbed();
