import { MUSIC_URL } from "./content";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicTimer: number | null = null;
let musicEl: HTMLAudioElement | null = null;
let muted = false;

function ac() {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, vol = 0.08, type: OscillatorType = "triangle") {
  const c = ac();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(vol, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(master!);
  o.start(start);
  o.stop(start + dur + 0.05);
}

// Gentle music-box loop (C major pentatonic lullaby)
const melody = [523, 659, 784, 659, 880, 784, 659, 587, 523, 587, 659, 523, 440, 523, 587, 0];
const bass = [131, 131, 175, 175, 165, 165, 147, 147];

export function startMusic() {
  if (MUSIC_URL) {
    if (!musicEl) {
      musicEl = new Audio(MUSIC_URL);
      musicEl.loop = true;
      musicEl.volume = 0.4;
    }
    musicEl.muted = muted;
    musicEl.play().catch(() => {});
    return;
  }
  if (musicTimer) return;
  const c = ac();
  let step = 0;
  const beat = 0.42;
  let next = c.currentTime + 0.1;
  musicTimer = window.setInterval(() => {
    while (next < c.currentTime + 0.6) {
      const n = melody[step % melody.length];
      if (n) tone(n, next, 1.4, 0.045, "sine");
      if (n) tone(n * 2, next, 0.6, 0.012, "triangle");
      if (step % 2 === 0) tone(bass[(step / 2) % bass.length], next, 1.6, 0.03, "sine");
      next += beat;
      step++;
    }
  }, 150);
}

export function setMuted(m: boolean) {
  muted = m;
  if (musicEl) musicEl.muted = m;
  if (master && ctx) master.gain.setTargetAtTime(m ? 0 : 0.5, ctx.currentTime, 0.1);
}

export const sfx = {
  chime() {
    const t = ac().currentTime;
    [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, t + i * 0.07, 0.6, 0.05, "sine"));
  },
  unlock() {
    const t = ac().currentTime;
    tone(220, t, 0.08, 0.08, "square");
    tone(330, t + 0.08, 0.1, 0.06, "square");
    [784, 988, 1175].forEach((f, i) => tone(f, t + 0.2 + i * 0.08, 0.7, 0.05, "sine"));
  },
  pop() {
    const t = ac().currentTime;
    tone(880, t, 0.15, 0.06, "sine");
    tone(1320, t + 0.05, 0.2, 0.04, "sine");
  },
  paper() {
    const t = ac().currentTime;
    tone(392, t, 0.3, 0.04, "triangle");
    tone(523, t + 0.1, 0.4, 0.04, "triangle");
  },
  whoosh() {
    const c = ac();
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.frequency.setValueAtTime(200, t);
    o.frequency.exponentialRampToValueAtTime(1200, t + 0.5);
    g.gain.setValueAtTime(0.04, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    o.connect(g).connect(master!);
    o.start(t);
    o.stop(t + 0.7);
  },
  celebrate() {
    const t = ac().currentTime;
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, t + i * 0.11, 0.8, 0.05, "triangle"));
  },
};

/** Listens to the microphone and calls onBlow when a strong breath is detected. Returns a stop fn. */
export async function listenForBlow(onBlow: () => void): Promise<() => void> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const c = ac();
  const src = c.createMediaStreamSource(stream);
  const an = c.createAnalyser();
  an.fftSize = 512;
  src.connect(an);
  const data = new Uint8Array(an.frequencyBinCount);
  let raf = 0;
  let hits = 0;
  const loop = () => {
    an.getByteFrequencyData(data);
    let low = 0;
    for (let i = 0; i < 20; i++) low += data[i];
    low /= 20;
    hits = low > 130 ? hits + 1 : Math.max(0, hits - 1);
    if (hits > 8) {
      stop();
      onBlow();
      return;
    }
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    stream.getTracks().forEach((t) => t.stop());
  };
  loop();
  return stop;
}
