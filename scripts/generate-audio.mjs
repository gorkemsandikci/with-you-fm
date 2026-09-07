import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "public", "audio");
const SR_MUSIC = 22050;
const SR_SFX = 44100;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v) {
  return Math.max(-1, Math.min(1, v));
}

function midiToFreq(m) {
  return 440 * Math.pow(2, (m - 69) / 12);
}

function env(t, a, d, s, r, dur) {
  if (t < 0) return 0;
  if (t < a) return t / a;
  if (t < a + d) return 1 - ((t - a) / d) * (1 - s);
  if (t < dur - r) return s;
  if (t < dur) return s * (1 - (t - (dur - r)) / r);
  return 0;
}

function lowpassState() {
  return { y: 0 };
}

function lowpass(state, x, cutoff, sr) {
  const rc = 1 / (2 * Math.PI * cutoff);
  const dt = 1 / sr;
  const alpha = dt / (rc + dt);
  state.y += alpha * (x - state.y);
  return state.y;
}

function writeWav(filePath, samples, sr) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sr, 24);
  buf.writeUInt32LE(sr * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  let peak = 1;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(samples[i]));
  const g = 0.86 / peak;
  for (let i = 0; i < n; i++) {
    const s = clamp(samples[i] * g);
    buf.writeInt16LE((s * 32767) | 0, 44 + i * 2);
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buf);
}

function fadeEdges(samples, sr, ms) {
  const f = Math.floor((ms / 1000) * sr);
  for (let i = 0; i < f && i < samples.length; i++) {
    const a = i / f;
    samples[i] *= a;
    samples[samples.length - 1 - i] *= a;
  }
}

function addDelay(samples, sr, ms, feedback) {
  const d = Math.floor((ms / 1000) * sr);
  const out = samples.slice();
  for (let i = d; i < out.length; i++) {
    out[i] += samples[i - d] * feedback;
  }
  return out;
}

function makeStatic(seconds, sr, seed) {
  const rng = mulberry32(seed);
  const n = Math.floor(seconds * sr);
  const samples = new Float64Array(n);
  const lp = lowpassState();
  const hp = lowpassState();
  for (let i = 0; i < n; i++) {
    let x = rng() * 2 - 1;
    if (rng() < 0.004) x += (rng() * 2 - 1) * 2.4;
    const dark = lowpass(lp, x, 2800, sr);
    const air = x - lowpass(hp, x, 400, sr);
    samples[i] = dark * 0.45 + air * 0.22;
  }
  fadeEdges(samples, sr, 40);
  return samples;
}

function makeTick(sr) {
  const n = Math.floor(0.09 * sr);
  const samples = new Float64Array(n);
  const rng = mulberry32(9);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const click = Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t * 70);
    const wood = (rng() * 2 - 1) * Math.exp(-t * 90);
    samples[i] = click * 0.35 + wood * 0.2;
  }
  return samples;
}

function makeClick(sr) {
  const n = Math.floor(0.12 * sr);
  const samples = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    samples[i] =
      Math.sin(2 * Math.PI * 420 * t) * Math.exp(-t * 28) * 0.4 +
      Math.sin(2 * Math.PI * 920 * t) * Math.exp(-t * 40) * 0.15;
  }
  return samples;
}

function makeClunk(sr) {
  const n = Math.floor(0.28 * sr);
  const samples = new Float64Array(n);
  const rng = mulberry32(44);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    samples[i] =
      Math.sin(2 * Math.PI * 90 * t) * Math.exp(-t * 8) * 0.55 +
      (rng() * 2 - 1) * Math.exp(-t * 18) * 0.25;
  }
  return samples;
}

function makeRadioOn(sr) {
  const n = Math.floor(1.35 * sr);
  const samples = new Float64Array(n);
  const rng = mulberry32(71);
  const lp = lowpassState();
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const sweep = 180 + t * 900;
    const tone = Math.sin(2 * Math.PI * sweep * t) * env(t, 0.02, 0.1, 0.5, 0.5, 1.35);
    const hiss = lowpass(lp, rng() * 2 - 1, 1800, sr) * (1 - t / 1.35) * 0.35;
    samples[i] = tone * 0.32 + hiss;
  }
  return samples;
}

function makeRadioOff(sr) {
  const n = Math.floor(0.45 * sr);
  const samples = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    samples[i] =
      Math.sin(2 * Math.PI * (240 - t * 180) * t) * Math.exp(-t * 7) * 0.4;
  }
  return samples;
}

function makeSip(sr) {
  const n = Math.floor(0.55 * sr);
  const samples = new Float64Array(n);
  const rng = mulberry32(12);
  const lp = lowpassState();
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const gurgle = Math.sin(2 * Math.PI * (90 + Math.sin(t * 40) * 30) * t);
    const bubbles = lowpass(lp, rng() * 2 - 1, 900, sr);
    samples[i] =
      gurgle * env(t, 0.04, 0.1, 0.5, 0.2, 0.55) * 0.22 +
      bubbles * env(t, 0.01, 0.05, 0.4, 0.2, 0.55) * 0.2;
  }
  return samples;
}

function makeSteam(sr) {
  const n = Math.floor(0.9 * sr);
  const samples = new Float64Array(n);
  const rng = mulberry32(99);
  const lp = lowpassState();
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const h = lowpass(lp, rng() * 2 - 1, 2400, sr);
    samples[i] = h * env(t, 0.05, 0.2, 0.4, 0.4, 0.9) * 0.22;
  }
  return samples;
}

function makeDrop(sr) {
  const n = Math.floor(0.22 * sr);
  const samples = new Float64Array(n);
  const rng = mulberry32(3);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    samples[i] =
      Math.sin(2 * Math.PI * 140 * t) * Math.exp(-t * 16) * 0.3 +
      (rng() * 2 - 1) * Math.exp(-t * 40) * 0.12;
  }
  return samples;
}

function makeMonkey(sr) {
  const n = Math.floor(0.32 * sr);
  const samples = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const f = 620 + Math.sin(t * 50) * 80;
    samples[i] =
      Math.sin(2 * Math.PI * f * t) * env(t, 0.01, 0.05, 0.4, 0.12, 0.32) * 0.28;
  }
  return samples;
}

function makeAngry(sr) {
  const n = Math.floor(0.4 * sr);
  const samples = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    samples[i] =
      Math.sin(2 * Math.PI * (340 + t * 220) * t) * env(t, 0.01, 0.04, 0.5, 0.15, 0.4) * 0.3;
  }
  return samples;
}

function makeChime(sr) {
  const n = Math.floor(1.6 * sr);
  const samples = new Float64Array(n);
  const notes = [659.25, 783.99, 987.77];
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    let v = 0;
    notes.forEach((f, idx) => {
      const dt = t - idx * 0.18;
      if (dt > 0) v += Math.sin(2 * Math.PI * f * dt) * Math.exp(-dt * 2.2) * 0.22;
    });
    samples[i] = v;
  }
  return samples;
}

function makeThunder(sr) {
  const n = Math.floor(2.4 * sr);
  const samples = new Float64Array(n);
  const rng = mulberry32(777);
  const lp = lowpassState();
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const rumble = lowpass(lp, rng() * 2 - 1, 180 + t * 40, sr);
    samples[i] = rumble * env(t, 0.05, 0.4, 0.35, 1.2, 2.4) * 0.9;
  }
  return samples;
}

function makePage(sr) {
  const n = Math.floor(0.35 * sr);
  const samples = new Float64Array(n);
  const rng = mulberry32(21);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    samples[i] = (rng() * 2 - 1) * Math.exp(-t * 12) * 0.28;
  }
  return samples;
}

function makeAmbience(kind, seconds, sr) {
  const n = Math.floor(seconds * sr);
  const samples = new Float64Array(n);
  const rng = mulberry32(kind.length * 97 + 13);
  const lp = lowpassState();
  const lp2 = lowpassState();
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const nse = rng() * 2 - 1;
    let v = 0;
    if (kind === "room-night") {
      v = lowpass(lp, nse, 400, sr) * 0.12;
      v += Math.sin(2 * Math.PI * 52 * t) * 0.03;
      if (rng() < 0.00012) v += (rng() * 2 - 1) * 0.18;
    } else if (kind === "rain") {
      v = lowpass(lp, nse, 2200, sr) * 0.42;
      v += nse * Math.abs(nse) * 0.08;
    } else if (kind === "city-night") {
      v = lowpass(lp, nse, 500, sr) * 0.1;
      v += Math.sin(2 * Math.PI * 110 * t + Math.sin(t * 0.4)) * 0.04;
      if (rng() < 0.00008) v += Math.sin(2 * Math.PI * 740 * t) * 0.05;
    } else if (kind === "travel") {
      v = lowpass(lp, nse, 280, sr) * 0.22;
      v += Math.sin(2 * Math.PI * 38 * t) * 0.05;
      v += Math.sin(2 * Math.PI * 2.2 * t) * 0.03;
    } else if (kind === "vinyl-room") {
      v = lowpass(lp, nse, 900, sr) * 0.08;
      if (rng() < 0.02) v += (rng() * 2 - 1) * 0.08;
      v += Math.sin(2 * Math.PI * 0.55 * t) * 0.02;
    } else if (kind === "warm-day") {
      v = lowpass(lp, nse, 700, sr) * 0.07;
      v += Math.sin(2 * Math.PI * 220 * t) * 0.015;
    } else if (kind === "soft-wind") {
      v = lowpass(lp, nse, 600, sr) * 0.16;
      v += Math.sin(2 * Math.PI * 0.18 * t) * lowpass(lp2, nse, 300, sr) * 0.1;
    } else if (kind === "tape-hiss") {
      v = lowpass(lp, nse, 3200, sr) * 0.16;
      v += Math.sin(2 * Math.PI * 60 * t) * 0.02;
    } else if (kind === "secret") {
      v = lowpass(lp, nse, 800, sr) * 0.1;
      v += Math.sin(2 * Math.PI * 174 * t) * 0.03;
      v += Math.sin(2 * Math.PI * 277 * t) * 0.02;
    }
    samples[i] = v;
  }
  fadeEdges(samples, sr, 200);
  return samples;
}

const STATION_MUSIC = [
  { id: "evde-tek-1", bpm: 70, root: 57, scale: "minor", chords: [[0, 3, 7], [8, 12, 15], [3, 7, 10], [5, 8, 12]], cutoff: 1100, seed: 11, swing: 0.06 },
  { id: "evde-tek-2", bpm: 68, root: 52, scale: "minor", chords: [[0, 3, 7], [5, 8, 12], [8, 12, 15], [7, 10, 14]], cutoff: 1000, seed: 12, swing: 0.07 },
  { id: "gecmiste-1", bpm: 64, root: 53, scale: "minor", chords: [[0, 3, 7], [10, 14, 17], [5, 8, 12], [7, 10, 14]], cutoff: 900, seed: 21, swing: 0.04 },
  { id: "gecmiste-2", bpm: 62, root: 50, scale: "major", chords: [[0, 4, 7], [9, 12, 16], [5, 9, 12], [7, 11, 14]], cutoff: 850, seed: 22, swing: 0.05 },
  { id: "yagmur-1", bpm: 66, root: 59, scale: "minor", chords: [[0, 3, 7], [8, 12, 15], [5, 8, 12], [3, 7, 10]], cutoff: 980, seed: 31, swing: 0.08 },
  { id: "yagmur-2", bpm: 72, root: 54, scale: "minor", chords: [[0, 3, 7], [7, 10, 14], [8, 12, 15], [5, 8, 12]], cutoff: 1050, seed: 32, swing: 0.09 },
  { id: "gece-1", bpm: 58, root: 48, scale: "minor", chords: [[0, 3, 7], [7, 10, 14], [8, 12, 15], [3, 7, 10]], cutoff: 800, seed: 41, swing: 0.03 },
  { id: "gece-2", bpm: 60, root: 55, scale: "minor", chords: [[0, 3, 7], [5, 8, 12], [10, 14, 17], [8, 12, 15]], cutoff: 820, seed: 42, swing: 0.04 },
  { id: "yolda-1", bpm: 86, root: 55, scale: "major", chords: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]], cutoff: 1400, seed: 51, swing: 0.1 },
  { id: "yolda-2", bpm: 90, root: 57, scale: "major", chords: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [2, 5, 9]], cutoff: 1500, seed: 52, swing: 0.11 },
  { id: "mutlu-1", bpm: 96, root: 60, scale: "major", chords: [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]], cutoff: 1700, seed: 61, swing: 0.08 },
  { id: "mutlu-2", bpm: 92, root: 62, scale: "major", chords: [[0, 4, 7], [5, 9, 12], [0, 4, 7], [7, 11, 14]], cutoff: 1650, seed: 62, swing: 0.07 },
  { id: "nostalji-1", bpm: 74, root: 53, scale: "major", chords: [[0, 4, 7], [9, 12, 16], [5, 9, 12], [7, 11, 14]], cutoff: 950, seed: 71, swing: 0.12 },
  { id: "nostalji-2", bpm: 70, root: 58, scale: "minor", chords: [[0, 3, 7], [8, 12, 15], [3, 7, 10], [10, 14, 17]], cutoff: 920, seed: 72, swing: 0.1 },
  { id: "sakin-1", bpm: 54, root: 52, scale: "major", chords: [[0, 4, 7], [9, 12, 16], [4, 7, 11], [7, 11, 14]], cutoff: 780, seed: 81, swing: 0.02 },
  { id: "sakin-2", bpm: 52, root: 57, scale: "major", chords: [[0, 4, 7], [5, 9, 12], [9, 12, 16], [4, 7, 11]], cutoff: 760, seed: 82, swing: 0.02 },
  { id: "gizli-1", bpm: 77, root: 56, scale: "minor", chords: [[0, 3, 7], [6, 10, 13], [8, 11, 15], [3, 6, 10]], cutoff: 1300, seed: 91, swing: 0.14 },
];

function makeTrack(spec, seconds) {
  const sr = SR_MUSIC;
  const n = Math.floor(seconds * sr);
  const samples = new Float64Array(n);
  const rng = mulberry32(spec.seed);
  const beat = 60 / spec.bpm;
  const bar = beat * 4;
  const lp = lowpassState();
  const hatLp = lowpassState();
  const scale = spec.scale === "minor" ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];

  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const chordIndex = Math.floor(t / bar) % spec.chords.length;
    const chord = spec.chords[chordIndex];
    const inBar = t % bar;
    const eighth = beat / 2;
    const swung = inBar + (Math.floor(inBar / eighth) % 2 === 1 ? spec.swing * eighth : 0);
    let v = 0;

    for (let c = 0; c < chord.length; c++) {
      const f = midiToFreq(spec.root + chord[c] - 12);
      v += Math.sin(2 * Math.PI * f * t) * 0.07;
      v += Math.sin(2 * Math.PI * f * 2 * t) * 0.02;
    }

    const bassF = midiToFreq(spec.root + chord[0] - 24);
    const bassEnv = 0.55 + 0.45 * Math.cos(((t % beat) / beat) * Math.PI);
    v += Math.sin(2 * Math.PI * bassF * t) * 0.16 * bassEnv;

    const kickT = t % beat;
    if (Math.floor((t % bar) / beat) % 2 === 0) {
      v += Math.sin(2 * Math.PI * (90 - kickT * 70) * kickT) * Math.exp(-kickT * 14) * 0.28;
    }

    const hatT = swung % eighth;
    const hat = lowpass(hatLp, rng() * 2 - 1, 6000, sr);
    v += hat * Math.exp(-hatT * 50) * 0.045;

    const melodyEvery = beat * 2;
    const mSlot = t % melodyEvery;
    const degree = scale[Math.floor(t / melodyEvery) % scale.length];
    const mf = midiToFreq(spec.root + 12 + (chord[0] % 12) + degree);
    if (mSlot < beat * 0.9) {
      v += Math.sin(2 * Math.PI * mf * t) * env(mSlot, 0.02, 0.08, 0.35, 0.2, beat * 0.9) * 0.09;
    }

    const crackle = rng() < 0.018 ? (rng() * 2 - 1) * 0.04 : (rng() * 2 - 1) * 0.008;
    v += crackle;
    samples[i] = lowpass(lp, v, spec.cutoff, sr);
  }

  const wet = addDelay(samples, sr, spec.bpm < 70 ? 420 : 280, 0.22);
  fadeEdges(wet, sr, 120);
  return wet;
}

function main() {
  console.log("Generating WITH YOU FM audio...");

  const sfx = {
    "static.wav": makeStatic(2.2, SR_SFX, 4),
    "tick.wav": makeTick(SR_SFX),
    "click.wav": makeClick(SR_SFX),
    "clunk.wav": makeClunk(SR_SFX),
    "radio-on.wav": makeRadioOn(SR_SFX),
    "radio-off.wav": makeRadioOff(SR_SFX),
    "sip.wav": makeSip(SR_SFX),
    "steam.wav": makeSteam(SR_SFX),
    "drop.wav": makeDrop(SR_SFX),
    "monkey.wav": makeMonkey(SR_SFX),
    "angry.wav": makeAngry(SR_SFX),
    "chime.wav": makeChime(SR_SFX),
    "thunder.wav": makeThunder(SR_SFX),
    "page.wav": makePage(SR_SFX),
  };
  for (const [name, samples] of Object.entries(sfx)) {
    writeWav(path.join(ROOT, "sfx", name), samples, SR_SFX);
    console.log("sfx", name);
  }

  const amb = [
    "room-night",
    "rain",
    "city-night",
    "travel",
    "vinyl-room",
    "warm-day",
    "soft-wind",
    "tape-hiss",
    "secret",
  ];
  for (const kind of amb) {
    writeWav(path.join(ROOT, "ambience", kind + ".wav"), makeAmbience(kind, 10, SR_MUSIC), SR_MUSIC);
    console.log("ambience", kind);
  }

  for (const spec of STATION_MUSIC) {
    writeWav(path.join(ROOT, "music", spec.id + ".wav"), makeTrack(spec, 16), SR_MUSIC);
    console.log("music", spec.id);
  }

  console.log("Done.");
}

main();
