"use client";

import { Howl, Howler } from "howler";

const SFX: Record<string, string> = {
  static: "/audio/sfx/static.wav",
  tick: "/audio/sfx/tick.wav",
  click: "/audio/sfx/click.wav",
  clunk: "/audio/sfx/clunk.wav",
  radioOn: "/audio/sfx/radio-on.wav",
  radioOff: "/audio/sfx/radio-off.wav",
  sip: "/audio/sfx/sip.wav",
  steam: "/audio/sfx/steam.wav",
  drop: "/audio/sfx/drop.wav",
  monkey: "/audio/sfx/monkey.wav",
  angry: "/audio/sfx/angry.wav",
  chime: "/audio/sfx/chime.wav",
  thunder: "/audio/sfx/thunder.wav",
  page: "/audio/sfx/page.wav",
};

export class AudioSystem {
  private music: Howl | null = null;
  private ambience: Howl | null = null;
  private staticLoop: Howl | null = null;
  private sfx: Map<string, Howl> = new Map();
  private musicVol = 0.72;
  private ambienceVol = 0.28;
  private effectsVol = 0.45;
  private quietFactor = 1;
  private musicSrc: string | null = null;
  private ambienceSrc: string | null = null;
  private onMusicEnd: (() => void) | null = null;

  constructor() {
    Howler.volume(1);
    Object.entries(SFX).forEach(([id, src]) => {
      this.sfx.set(
        id,
        new Howl({
          src: [src],
          volume: this.effectsVol,
          preload: true,
        }),
      );
    });
    this.staticLoop = new Howl({
      src: [SFX.static],
      loop: true,
      volume: 0,
      preload: true,
    });
  }

  unlock() {
    if (Howler.ctx && Howler.ctx.state === "suspended") {
      void Howler.ctx.resume();
    }
    const tick = this.sfx.get("click");
    tick?.volume(0);
    tick?.play();
    tick?.volume(this.effectsVol);
  }

  setMusicVolume(v: number) {
    this.musicVol = v;
    this.music?.volume(v * this.quietFactor);
  }

  setAmbienceVolume(v: number) {
    this.ambienceVol = v;
    this.ambience?.volume(v * this.quietFactor * 0.9);
  }

  setEffectsVolume(v: number) {
    this.effectsVol = v;
    this.sfx.forEach((h, id) => {
      if (id !== "static") h.volume(v);
    });
  }

  setQuiet(quiet: boolean) {
    this.quietFactor = quiet ? 0.45 : 1;
    this.music?.volume(this.musicVol * this.quietFactor);
    this.ambience?.volume(this.ambienceVol * this.quietFactor * 0.9);
  }

  playSfx(id: keyof typeof SFX | string, volume?: number) {
    const h = this.sfx.get(id);
    if (!h) return;
    h.volume((volume ?? 1) * this.effectsVol * this.quietFactor);
    h.play();
  }

  startStatic(volume = 0.35) {
    if (!this.staticLoop) return;
    if (!this.staticLoop.playing()) this.staticLoop.play();
    this.staticLoop.fade(this.staticLoop.volume(), volume * this.effectsVol, 180);
  }

  stopStatic(fade = 400) {
    if (!this.staticLoop) return;
    const cur = this.staticLoop.volume();
    this.staticLoop.fade(cur, 0, fade);
    window.setTimeout(() => {
      if (this.staticLoop && this.staticLoop.volume() < 0.02) this.staticLoop.stop();
    }, fade + 40);
  }

  playMusic(src: string, onEnd?: () => void) {
    this.onMusicEnd = onEnd ?? null;
    if (this.musicSrc === src && this.music) {
      if (!this.music.playing()) this.music.play();
      return;
    }
    this.music?.fade(this.music.volume(), 0, 280);
    const old = this.music;
    window.setTimeout(() => old?.unload(), 360);
    this.musicSrc = src;
    this.music = new Howl({
      src: [src],
      html5: false,
      volume: 0,
      onend: () => this.onMusicEnd?.(),
    });
    this.music.play();
    this.music.fade(0, this.musicVol * this.quietFactor, 700);
  }

  pauseMusic() {
    this.music?.pause();
  }

  resumeMusic() {
    if (this.music && !this.music.playing()) this.music.play();
  }

  stopMusic(fade = 500) {
    if (!this.music) return;
    this.music.fade(this.music.volume(), 0, fade);
    const old = this.music;
    this.music = null;
    this.musicSrc = null;
    window.setTimeout(() => old.unload(), fade + 40);
  }

  playAmbience(src: string) {
    if (this.ambienceSrc === src && this.ambience?.playing()) return;
    this.ambience?.fade(this.ambience.volume(), 0, 800);
    const old = this.ambience;
    window.setTimeout(() => old?.unload(), 900);
    this.ambienceSrc = src;
    this.ambience = new Howl({
      src: [src],
      loop: true,
      volume: 0,
    });
    this.ambience.play();
    this.ambience.fade(0, this.ambienceVol * this.quietFactor * 0.9, 1100);
  }

  stopAmbience() {
    this.ambience?.fade(this.ambience.volume(), 0, 600);
  }
}

let singleton: AudioSystem | null = null;

export function getAudio(): AudioSystem {
  if (typeof window === "undefined") {
    throw new Error("AudioSystem is client-only");
  }
  if (!singleton) singleton = new AudioSystem();
  return singleton;
}
