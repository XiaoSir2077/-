import { ASSETS } from '../constants';

class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private bgm: HTMLAudioElement | null = null;

  constructor() {
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn("Audio Context not supported");
    }
    // Pre-initialize sounds
    this.loadSound('JUMP', ASSETS.SOUNDS.JUMP);
    this.loadSound('SHOOT', ASSETS.SOUNDS.SHOOT);
    this.loadSound('EXPLOSION', ASSETS.SOUNDS.EXPLOSION);
    this.loadSound('COLLECT', ASSETS.SOUNDS.COLLECT);
    this.loadSound('WIN', ASSETS.SOUNDS.WIN);
    this.loadSound('GAMEOVER', ASSETS.SOUNDS.GAMEOVER);
  }

  private loadSound(key: string, src: string) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    // We don't strictly wait for load; if it fails, we fall back to synth in play methods
    this.sounds.set(key, audio);
  }

  playBGM() {
    if (this.bgm) return; // Already playing
    
    this.bgm = new Audio(ASSETS.SOUNDS.BGM);
    this.bgm.loop = true;
    this.bgm.volume = 0.5;
    
    const promise = this.bgm.play();
    if (promise !== undefined) {
      promise.catch(error => {
        console.log("BGM Autoplay prevented. Waiting for user interaction.", error);
      });
    }
  }

  stopBGM() {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.currentTime = 0;
      this.bgm = null;
    }
  }

  // Helper to play sound if file exists, else fallback to synth
  private playSfx(key: string, fallbackTone: () => void) {
    if (this.isMuted) return;

    const sound = this.sounds.get(key);
    if (sound) {
      // Clone node to allow overlapping sounds (rapid fire)
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = 0.6;
      const promise = clone.play();
      
      if (promise !== undefined) {
        promise.catch(() => {
          // If file fails (404 or format), play fallback
          fallbackTone();
        });
      }
    } else {
      fallbackTone();
    }
  }

  playJump() {
    this.playSfx('JUMP', () => this.playTone(400, 'sine', 0.1));
  }

  playCollect() {
    this.playSfx('COLLECT', () => {
      this.playTone(800, 'square', 0.1);
      setTimeout(() => this.playTone(1200, 'square', 0.1), 50);
    });
  }

  playShoot() {
    this.playSfx('SHOOT', () => this.playTone(150, 'sawtooth', 0.1));
  }

  playExplosion() {
    this.playSfx('EXPLOSION', () => this.playTone(100, 'sawtooth', 0.3));
  }

  playWin() {
    this.stopBGM();
    this.playSfx('WIN', () => {
      this.playTone(500, 'sine', 0.2);
      setTimeout(() => this.playTone(600, 'sine', 0.2), 200);
      setTimeout(() => this.playTone(700, 'sine', 0.4), 400);
    });
  }
  
  playGameOver() {
    this.stopBGM();
    this.playSfx('GAMEOVER', () => {
        this.playTone(300, 'sawtooth', 0.5);
        setTimeout(() => this.playTone(200, 'sawtooth', 0.5), 400);
    });
  }

  private playTone(freq: number, type: OscillatorType, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }
}

export const audioManager = new AudioService();