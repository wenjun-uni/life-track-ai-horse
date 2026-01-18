
// Sound Engine: "Heroic Gallop" & Browser Native TTS

let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// --- Synthesized Sounds ---

// Play a "Hoof" sound - Stronger and more grounded
export const playHoofBeat = (variant: 'heavy' | 'light' = 'heavy') => {
  const ctx = initAudio();
  if (!ctx) return;

  const t = ctx.currentTime;

  // 1. The Impact (Low Thud) - Deepened for power
  const osc = ctx.createOscillator();
  const gainOsc = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(variant === 'heavy' ? 60 : 100, t); // Lower pitch for heavy
  osc.frequency.exponentialRampToValueAtTime(10, t + 0.1);

  gainOsc.gain.setValueAtTime(0, t);
  gainOsc.gain.linearRampToValueAtTime(variant === 'heavy' ? 2.0 : 1.0, t + 0.005); // Sharp attack
  gainOsc.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

  osc.connect(gainOsc);
  gainOsc.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.2);

  // 2. The Surface (Crunch/Gravel)
  const bufferSize = ctx.sampleRate * 0.15; 
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.8; // Slightly softer noise
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 600;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0, t);
  noiseGain.gain.linearRampToValueAtTime(0.5, t + 0.01);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(t);
};

// Play a "Jade/Tile" Click
export const playClipClop = () => {
  const ctx = initAudio();
  if (!ctx) return;

  const t = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1800, t);
  osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.3, t + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + 0.1);
};

// Redesigned: Energetic, Heroic Whinny (FM Synthesis)
export const playWhinny = () => {
  const ctx = initAudio();
  if (!ctx) return;
  const t = ctx.currentTime;

  // Carrier: The main voice
  const carrier = ctx.createOscillator();
  carrier.type = 'sawtooth';

  // Modulator: Creates the "Rattle/Vibrato" texture
  const modulator = ctx.createOscillator();
  modulator.type = 'sine';

  const modulatorGain = ctx.createGain();

  // Pitch Envelope: Start High (Squeal) -> Drop
  // Much higher start for a "proud" call
  carrier.frequency.setValueAtTime(1200, t); 
  carrier.frequency.linearRampToValueAtTime(1500, t + 0.1); // Attack up slightly
  carrier.frequency.exponentialRampToValueAtTime(600, t + 1.2); // Long slide down

  // Vibrato Rate: Fast flutter -> Slow down
  modulator.frequency.setValueAtTime(12, t);
  modulator.frequency.linearRampToValueAtTime(6, t + 1.2);

  // Vibrato Depth (FM Depth)
  modulatorGain.gain.setValueAtTime(100, t); 
  modulatorGain.gain.linearRampToValueAtTime(50, t + 1.0);

  // Wiring FM
  modulator.connect(modulatorGain);
  modulatorGain.connect(carrier.frequency);

  // Main Volume Envelope
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, t);
  masterGain.gain.linearRampToValueAtTime(0.4, t + 0.05); // Fast attack
  masterGain.gain.exponentialRampToValueAtTime(0.01, t + 1.3); // Long tail

  // Filter to warm it up
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(3000, t);
  filter.frequency.linearRampToValueAtTime(2000, t + 1);

  carrier.connect(filter);
  filter.connect(masterGain);
  masterGain.connect(ctx.destination);

  carrier.start(t);
  modulator.start(t);
  
  carrier.stop(t + 1.5);
  modulator.stop(t + 1.5);
};

// --- Browser Native TTS (Works in China / Offline) ---
export const speakText = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.warn("Browser does not support Speech Synthesis");
      resolve();
      return;
    }
    
    // Cancel any ongoing speech to prevent overlapping
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN'; // Force Chinese
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('CN'));
    if (zhVoice) {
      utterance.voice = zhVoice;
    }

    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = (e) => {
      console.error("TTS Error:", e);
      resolve(); 
    };

    window.speechSynthesis.speak(utterance);
  });
};

export const playPcmAudio = async (base64Audio: string): Promise<void> => {
    return Promise.resolve();
};
