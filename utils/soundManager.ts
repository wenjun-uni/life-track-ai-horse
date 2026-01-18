
import { SoundConfig, SoundTheme } from "../types";

const STORAGE_KEY = 'life_track_sound_config_v2';

const DEFAULT_CONFIG: SoundConfig = {
  enabled: true,
  volume: 0.6,
  theme: 'epic'
};

class SoundManager {
  private ctx: AudioContext | null = null;
  private config: SoundConfig;
  private lastPlayTime: Record<string, number> = {};
  
  // Gallop Sequencer State
  private gallopTimer: any = null;
  private gallopIsRunning: boolean = false;
  private gallopLastTick: number = 0;
  private currentDragSpeed: number = 0; // 0 to 1
  private lastInteractionTime: number = 0;

  constructor() {
    this.config = DEFAULT_CONFIG;
    this.loadConfig();
  }

  private loadConfig() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.config = JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to load sound config");
    }
  }

  public saveConfig() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
  }

  public getConfig() {
    return this.config;
  }

  public setConfig(newConfig: Partial<SoundConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  private initCtx() {
    if (!this.ctx) {
      const CtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new CtxClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // --- Gallop Sequencer (Rhythmic Loop) ---

  public startGallop() {
    if (!this.config.enabled) return;
    this.initCtx();
    if (this.gallopIsRunning) return;
    
    this.gallopIsRunning = true;
    this.currentDragSpeed = 0; // Start slow
    this.lastInteractionTime = Date.now();
    this.scheduleNextGallop();
  }

  public updateGallop(speedNormalized: number) {
    // Speed input is roughly 0 to 1 (pixels per ms or similar)
    // We smooth it out
    this.currentDragSpeed = Math.min(1, Math.max(0, speedNormalized));
    this.lastInteractionTime = Date.now();
  }

  public stopGallop() {
    this.gallopIsRunning = false;
    if (this.gallopTimer) {
      clearTimeout(this.gallopTimer);
      this.gallopTimer = null;
    }
    // Play a final "stop" sound (like a skid or final step)
    if (this.config.enabled && this.ctx) {
       this.synthMaterialHit(this.ctx, this.ctx.currentTime, this.config.volume * 0.3, this.config.theme, 'tap');
    }
  }

  private scheduleNextGallop() {
    if (!this.gallopIsRunning) return;

    const now = Date.now();
    
    // Auto-stop if no movement for a while (prevents annoying loop if held still)
    if (now - this.lastInteractionTime > 300) {
       // Fade out or just pause? Pause is better.
       // We check again in 100ms
       this.gallopTimer = setTimeout(() => this.scheduleNextGallop(), 100);
       return;
    }

    // Map Speed to Interval (ms)
    // Slow (0) -> 350ms interval
    // Fast (1) -> 120ms interval
    const minInterval = 120;
    const maxInterval = 350;
    // Non-linear mapping for better feel
    const interval = maxInterval - (this.currentDragSpeed * (maxInterval - minInterval));
    
    // Volume based on speed (Faster = Louder)
    const dynamicVol = this.config.volume * (0.3 + (this.currentDragSpeed * 0.7));

    if (this.ctx) {
        // Play the hoof sound
        this.synthHoofRealistic(this.ctx, this.ctx.currentTime, dynamicVol, this.config.theme);
    }

    this.gallopTimer = setTimeout(() => this.scheduleNextGallop(), interval);
  }

  // --- Public Play Method (Single Shot) ---

  public play(id: 'ui.tap' | 'ui.select' | 'nav.switch' | 'slider.gallop' | 'home.enter' | 'result.success' | 'page.turn' | 'error' | 'success.stamp') {
    if (!this.config.enabled) return;
    
    const now = Date.now();
    const throttleMap: Record<string, number> = {
      'slider.gallop': 0, // Handled by sequencer now, but keeping for legacy calls
      'ui.tap': 40,
      'nav.switch': 80
    };
    if (throttleMap[id] && this.lastPlayTime[id] && (now - this.lastPlayTime[id] < throttleMap[id])) {
      return;
    }
    this.lastPlayTime[id] = now;

    const ctx = this.initCtx();
    if (!ctx) return;

    const t = ctx.currentTime;
    const vol = this.config.volume;
    const theme = this.config.theme;

    try {
      switch (id) {
        case 'ui.tap':
          this.synthMaterialHit(ctx, t, vol, theme, 'tap');
          break;
        case 'ui.select':
          this.synthMaterialHit(ctx, t, vol, theme, 'select');
          break;
        case 'nav.switch':
          this.synthSwish(ctx, t, vol, theme);
          break;
        case 'slider.gallop':
          // Legacy call, prefer startGallop/stopGallop
          this.synthHoofRealistic(ctx, t, vol, theme);
          break;
        case 'home.enter':
          this.synthGong(ctx, t, vol, theme, 0.5); 
          break;
        case 'result.success':
          this.synthGong(ctx, t, vol, theme, 1.0);
          this.synthArpeggio(ctx, t + 0.2, vol, theme);
          break;
        case 'page.turn':
          this.synthPaper(ctx, t, vol);
          break;
        case 'success.stamp':
          this.synthThud(ctx, t, vol);
          break;
        case 'error':
           this.synthError(ctx, t, vol);
           break;
      }
    } catch (e) {
      console.error("Audio synth error", e);
    }
  }

  // --- Advanced Ancient Synthesizers ---

  // 1. Material Hit: Simulates Wood, Stone, Metal, Leather
  private synthMaterialHit(ctx: AudioContext, t: number, vol: number, theme: SoundTheme, type: 'tap' | 'select') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    let freq = 0;
    let dur = 0;
    
    // Theme profiles
    switch (theme) {
        case 'epic': // War Drum (Leather)
            freq = type === 'tap' ? 150 : 220;
            dur = 0.15;
            osc.type = 'triangle'; // Rounder sound
            filter.type = 'lowpass';
            filter.frequency.value = 400;
            break;
        case 'ink': // Water Drop
            freq = type === 'tap' ? 800 : 1200;
            dur = 0.1;
            osc.type = 'sine'; // Pure sound
            // Pitch bend for droplet effect
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.8, t + 0.05);
            break;
        case 'jade': // Stone Chime (Clear, Hard)
            freq = type === 'tap' ? 1800 : 2400;
            dur = type === 'tap' ? 0.05 : 0.3; // Longer ring for select
            osc.type = 'sine';
            break;
        case 'bamboo': // Wood Block (Hollow)
            freq = type === 'tap' ? 400 : 600;
            dur = 0.05; // Very short
            osc.type = 'square'; // Woody harmonic
            filter.type = 'bandpass';
            filter.frequency.value = freq;
            filter.Q.value = 1;
            break;
        case 'zen': // Bronze Bell
            freq = type === 'tap' ? 523 : 659;
            dur = type === 'tap' ? 0.2 : 1.5;
            osc.type = 'triangle';
            break;
        case 'retro': // Wooden Gear
            freq = type === 'tap' ? 220 : 440;
            dur = 0.08;
            osc.type = 'sawtooth';
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            break;
    }

    if (theme !== 'ink') osc.frequency.setValueAtTime(freq, t);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol * 0.5, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(filter);
    if (theme === 'jade' || theme === 'ink' || theme === 'zen') {
        filter.frequency.value = 20000; // Open
    }
    
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + dur + 0.1);
  }

  // 2. Realistic Hoof
  private synthHoofRealistic(ctx: AudioContext, t: number, vol: number, theme: SoundTheme) {
    const masterGain = ctx.createGain();
    masterGain.gain.value = vol;
    masterGain.connect(ctx.destination);

    // Layer A: Sub Thud
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.frequency.setValueAtTime(80, t);
    osc1.frequency.exponentialRampToValueAtTime(40, t + 0.08);
    g1.gain.setValueAtTime(0.8, t);
    g1.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    osc1.connect(g1);
    g1.connect(masterGain);
    osc1.start(t); osc1.stop(t+0.15);

    // Layer B: The Knock
    if (theme !== 'epic') {
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        const f2 = ctx.createBiquadFilter();
        
        osc2.type = 'square';
        const pitch = theme === 'jade' ? 800 : (theme === 'ink' ? 600 : 300);
        osc2.frequency.setValueAtTime(pitch, t);
        
        f2.type = 'bandpass';
        f2.frequency.value = pitch;
        
        g2.gain.setValueAtTime(0.3, t);
        g2.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

        osc2.connect(f2);
        f2.connect(g2);
        g2.connect(masterGain);
        osc2.start(t); osc2.stop(t+0.1);
    }

    // Layer C: Gravel/Dirt
    const noise = ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();
    const f3 = ctx.createBiquadFilter();
    const g3 = ctx.createGain();
    
    f3.type = 'highpass';
    f3.frequency.value = 800;
    
    g3.gain.setValueAtTime(0.4, t);
    g3.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    noise.connect(f3);
    f3.connect(g3);
    g3.connect(masterGain);
    noise.start(t); noise.stop(t+0.1);
  }

  // 3. Gong/Bell
  private synthGong(ctx: AudioContext, t: number, vol: number, theme: SoundTheme, durationScale: number) {
      const carrier = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      const outGain = ctx.createGain();

      const baseFreq = theme === 'epic' ? 100 : (theme === 'jade' ? 1200 : 200);
      
      carrier.frequency.value = baseFreq;
      modulator.frequency.value = baseFreq * 1.414; 
      
      modGain.gain.setValueAtTime(baseFreq * 2, t);
      modGain.gain.exponentialRampToValueAtTime(1, t + (2 * durationScale));

      outGain.gain.setValueAtTime(0, t);
      outGain.gain.linearRampToValueAtTime(vol, t + 0.05);
      outGain.gain.exponentialRampToValueAtTime(0.001, t + (3 * durationScale));

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(outGain);
      outGain.connect(ctx.destination);

      carrier.start(t); carrier.stop(t + (3.5 * durationScale));
      modulator.start(t); modulator.stop(t + (3.5 * durationScale));
  }

  // 4. Arpeggio
  private synthArpeggio(ctx: AudioContext, t: number, vol: number, theme: SoundTheme) {
      const notes = [523.25, 587.33, 659.25, 783.99, 880.00]; 
      
      notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = theme === 'epic' ? 'sawtooth' : 'triangle';
          osc.frequency.value = freq;
          
          const start = t + (i * 0.08);
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(vol * 0.2, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 1.0);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 1.2);
      });
  }

  private synthSwish(ctx: AudioContext, t: number, vol: number, theme: SoundTheme) {
    const noise = ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();
    const filter = ctx.createBiquadFilter();
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.linearRampToValueAtTime(1200, t + 0.15);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol * 0.3, t + 0.05);
    gain.gain.linearRampToValueAtTime(0, t + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 0.2);
  }

  private synthPaper(ctx: AudioContext, t: number, vol: number) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer();
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol * 0.2, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(t);
      noise.stop(t + 0.15);
  }

  private synthThud(ctx: AudioContext, t: number, vol: number) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(10, t + 0.1);
      
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
  }

  private synthError(ctx: AudioContext, t: number, vol: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, t);
    
    gain.gain.setValueAtTime(vol * 0.5, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t+0.25);
  }
  
  private createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02; 
        lastOut = data[i];
        data[i] *= 3.5; 
    }
    return buffer;
  }
}

export const soundManager = new SoundManager();
