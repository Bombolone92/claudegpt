// Audio engine for procedural cinematic soundscapes and synchronized speech synthesis

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentSpeech: SpeechSynthesisUtterance | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : 0.15, this.ctx.currentTime);
    }
    if (muted && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  public getAudioStreamDestination(): MediaStreamAudioDestinationNode | null {
    this.initContext();
    if (!this.ctx) return null;
    return this.ctx.createMediaStreamDestination();
  }

  public playWhoosh(destNode?: MediaStreamAudioDestinationNode) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3200, this.ctx.currentTime + 0.15);
      filter.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.4);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, this.ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      if (destNode) gain.connect(destNode);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.45);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  public playCinematicImpact(destNode?: MediaStreamAudioDestinationNode) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.8);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.85);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      if (destNode) gain.connect(destNode);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.9);
    } catch (e) {}
  }

  public startStyleAmbience(style: string, destNode?: MediaStreamAudioDestinationNode) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.stopAmbience();

    try {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      this.ambientGain.connect(this.ctx.destination);
      if (destNode) this.ambientGain.connect(destNode);

      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc2 = this.ctx.createOscillator();

      if (style.includes('Pixar')) {
        // Bright playful chord pad
        this.ambientOsc1.type = 'sine';
        this.ambientOsc1.frequency.setValueAtTime(392.00, this.ctx.currentTime); // G4
        this.ambientOsc2.type = 'triangle';
        this.ambientOsc2.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      } else if (style.includes('Anime')) {
        // High-energy synth drone
        this.ambientOsc1.type = 'sawtooth';
        this.ambientOsc1.frequency.setValueAtTime(130.81, this.ctx.currentTime); // C3
        this.ambientOsc2.type = 'sine';
        this.ambientOsc2.frequency.setValueAtTime(261.63, this.ctx.currentTime); // C4
      } else if (style.includes('Black & White')) {
        // Vintage 50s projector hum / vinyl warmth
        this.ambientOsc1.type = 'triangle';
        this.ambientOsc1.frequency.setValueAtTime(60, this.ctx.currentTime); // 60Hz hum
        this.ambientOsc2.type = 'sine';
        this.ambientOsc2.frequency.setValueAtTime(180, this.ctx.currentTime);
      } else {
        // Hollywood cinematic deep sub-drone
        this.ambientOsc1.type = 'sine';
        this.ambientOsc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 sub
        this.ambientOsc2.type = 'sine';
        this.ambientOsc2.frequency.setValueAtTime(110, this.ctx.currentTime); // A2
      }

      this.ambientOsc1.connect(this.ambientGain);
      this.ambientOsc2.connect(this.ambientGain);
      this.ambientOsc1.start();
      this.ambientOsc2.start();
    } catch (e) {}
  }

  public stopAmbience() {
    try {
      if (this.ambientOsc1) {
        this.ambientOsc1.stop();
        this.ambientOsc1.disconnect();
        this.ambientOsc1 = null;
      }
      if (this.ambientOsc2) {
        this.ambientOsc2.stop();
        this.ambientOsc2.disconnect();
        this.ambientOsc2 = null;
      }
    } catch (e) {}
  }

  public speakDialogue(text: string, speaker: string, onEnd?: () => void) {
    if (this.isMuted || typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'it-IT';
      
      // Slight pitch shift based on speaker name hash for distinctive character voices
      let hash = 0;
      for (let i = 0; i < speaker.length; i++) {
        hash = speaker.charCodeAt(i) + ((hash << 5) - hash);
      }
      const pitchMod = 0.85 + (Math.abs(hash) % 40) / 100; // 0.85 to 1.25
      utterance.pitch = pitchMod;
      utterance.rate = 1.05;

      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      this.currentSpeech = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      if (onEnd) onEnd();
    }
  }

  public stopSpeech() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioEngine = new AudioEngine();
