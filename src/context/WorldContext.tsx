"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  COPY,
  DEFAULT_POSITIONS,
  MAX_FREQ,
  MIN_FREQ,
  getStationById,
  nearestStation,
} from "@/data/stations";
import { getAudio } from "@/systems/AudioSystem";
import { sceneFromStation } from "@/systems/SceneSystem";
import type {
  AppPhase,
  ObjectPos,
  PanelId,
  Pointer,
  Station,
} from "@/types/world";

type WorldValue = {
  phase: AppPhase;
  setPhase: (p: AppPhase) => void;
  radioOn: boolean;
  playing: boolean;
  frequency: number;
  station: Station;
  tuned: boolean;
  trackIndex: number;
  transitioning: boolean;
  secretUnlocked: boolean;
  coffeeLevel: number;
  coffeeHearts: boolean;
  coffeeClicks: number;
  clockClicks: number;
  monkeyClicks: number;
  monkeyAngry: boolean;
  astronautWave: number;
  hiddenNote: boolean;
  plantBloom: boolean;
  roomQuiet: boolean;
  idleMs: number;
  panel: PanelId;
  setPanel: (p: PanelId) => void;
  positions: Record<string, ObjectPos>;
  setObjectPos: (id: string, pos: Partial<ObjectPos>) => void;
  pointer: Pointer;
  setPointer: (p: Pointer) => void;
  musicVolume: number;
  ambienceVolume: number;
  effectsVolume: number;
  setMusicVolume: (v: number) => void;
  setAmbienceVolume: (v: number) => void;
  setEffectsVolume: (v: number) => void;
  enterRoom: () => void;
  togglePower: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setFrequency: (f: number, fromDial?: boolean) => void;
  tuneToStation: (id: string) => void;
  sipCoffee: (delta: number) => void;
  clickCoffee: () => void;
  clickClock: () => void;
  clickMonkey: () => void;
  clickAstronaut: () => void;
  revealNote: () => void;
  bloomPlant: () => void;
  bumpIdle: (ms: number) => void;
  resetIdle: () => void;
  brand: typeof COPY;
};

const WorldContext = createContext<WorldValue | null>(null);

const FIRST_STATION = getStationById("evde-tek");

export function WorldProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<AppPhase>("loading");
  const [radioOn, setRadioOn] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [frequency, setFreq] = useState(88);
  const [stationId, setStationId] = useState("evde-tek");
  const [tuned, setTuned] = useState(true);
  const [trackIndex, setTrackIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [secretUnlocked, setSecretUnlocked] = useState(false);
  const [coffeeLevel, setCoffeeLevel] = useState(72);
  const [coffeeHearts, setCoffeeHearts] = useState(false);
  const [coffeeClicks, setCoffeeClicks] = useState(0);
  const [clockClicks, setClockClicks] = useState(0);
  const [monkeyClicks, setMonkeyClicks] = useState(0);
  const [monkeyAngry, setMonkeyAngry] = useState(false);
  const [astronautWave, setAstronautWave] = useState(0);
  const [hiddenNote, setHiddenNote] = useState(false);
  const [plantBloom, setPlantBloom] = useState(false);
  const [roomQuiet, setRoomQuiet] = useState(false);
  const [idleMs, setIdleMs] = useState(0);
  const [panel, setPanel] = useState<PanelId>(null);
  const [positions, setPositions] = useState(DEFAULT_POSITIONS);
  const [pointer, setPointer] = useState<Pointer>({ x: 50, y: 50 });
  const [musicVolume, setMusicVol] = useState(0.72);
  const [ambienceVolume, setAmbVol] = useState(0.28);
  const [effectsVolume, setFxVol] = useState(0.45);

  const transitionRef = useRef<number | null>(null);
  const station = getStationById(stationId);

  const startTrackRef = useRef<(st: Station, index: number) => void>(() => {});

  const startCurrentTrack = useCallback((st: Station, index: number) => {
    const audio = getAudio();
    const track = st.playlist[index % st.playlist.length];
    audio.playMusic(track.src, () => {
      const next = (index + 1) % st.playlist.length;
      setTrackIndex(next);
      startTrackRef.current(st, next);
    });
    audio.playAmbience(`/audio/ambience/${st.ambience}.wav`);
  }, []);

  useEffect(() => {
    startTrackRef.current = startCurrentTrack;
  }, [startCurrentTrack]);

  const applyStation = useCallback(
    (next: Station, options?: { snapFreq?: boolean }) => {
      const audio = getAudio();
      const atmosphere = sceneFromStation(next);
      setTransitioning(true);
      audio.startStatic(0.42);
      audio.playSfx("clunk", 0.5);
      if (next.window === "rain") {
        window.setTimeout(() => audio.playSfx("thunder", 0.7), 600);
      }
      if (transitionRef.current) window.clearTimeout(transitionRef.current);
      transitionRef.current = window.setTimeout(() => {
        setStationId(next.id);
        setTrackIndex(0);
        if (options?.snapFreq !== false) setFreq(next.frequency);
        setTuned(true);
        audio.stopStatic(500);
        if (radioOn && playing) startCurrentTrack(next, 0);
        else audio.playAmbience(`/audio/ambience/${atmosphere.ambience}.wav`);
        setTransitioning(false);
      }, atmosphere.transitionMs);
    },
    [playing, radioOn, startCurrentTrack],
  );

  const enterRoom = useCallback(() => {
    const audio = getAudio();
    audio.unlock();
    audio.playSfx("radioOn", 0.9);
    setRadioOn(true);
    setPlaying(true);
    setPhase("room");
    window.setTimeout(() => {
      startCurrentTrack(FIRST_STATION, 0);
    }, 400);
  }, [startCurrentTrack]);

  const togglePower = useCallback(() => {
    const audio = getAudio();
    if (radioOn) {
      audio.playSfx("radioOff");
      audio.stopMusic(400);
      audio.stopAmbience();
      setRadioOn(false);
      setPlaying(false);
    } else {
      audio.playSfx("radioOn");
      setRadioOn(true);
      setPlaying(true);
      startCurrentTrack(station, trackIndex);
    }
  }, [radioOn, startCurrentTrack, station, trackIndex]);

  const togglePlay = useCallback(() => {
    const audio = getAudio();
    audio.playSfx("click");
    if (!radioOn) {
      setRadioOn(true);
      setPlaying(true);
      startCurrentTrack(station, trackIndex);
      return;
    }
    if (playing) {
      audio.pauseMusic();
      setPlaying(false);
    } else {
      audio.resumeMusic();
      setPlaying(true);
    }
  }, [playing, radioOn, startCurrentTrack, station, trackIndex]);

  const nextTrack = useCallback(() => {
    if (!radioOn) return;
    getAudio().playSfx("click", 0.6);
    const next = (trackIndex + 1) % station.playlist.length;
    setTrackIndex(next);
    startCurrentTrack(station, next);
  }, [radioOn, startCurrentTrack, station, trackIndex]);

  const prevTrack = useCallback(() => {
    if (!radioOn) return;
    getAudio().playSfx("click", 0.6);
    const next = (trackIndex - 1 + station.playlist.length) % station.playlist.length;
    setTrackIndex(next);
    startCurrentTrack(station, next);
  }, [radioOn, startCurrentTrack, station, trackIndex]);

  const setFrequency = useCallback(
    (f: number, fromDial = false) => {
      const clamped = Math.min(MAX_FREQ, Math.max(MIN_FREQ, f));
      setFreq(clamped);
      const { station: near, locked } = nearestStation(clamped, secretUnlocked);
      setTuned(locked);
      const audio = getAudio();
      if (!locked) {
        audio.startStatic(0.22 + Math.min(0.3, Math.abs(clamped - near.frequency) * 0.15));
        if (playing) audio.pauseMusic();
      } else if (fromDial && near.id !== stationId) {
        applyStation(near, { snapFreq: false });
      } else if (locked) {
        audio.stopStatic(200);
        if (playing && radioOn) audio.resumeMusic();
      }
    },
    [applyStation, playing, radioOn, secretUnlocked, stationId],
  );

  const tuneToStation = useCallback(
    (id: string) => {
      const next = getStationById(id);
      if (next.secret && !secretUnlocked) return;
      applyStation(next);
    },
    [applyStation, secretUnlocked],
  );

  const sipCoffee = useCallback((delta: number) => {
    setCoffeeLevel((v) => {
      let n = v + delta;
      if (n < 4) n = 4;
      if (n > 96) n = 96;
      return n;
    });
  }, []);

  const clickCoffee = useCallback(() => {
    getAudio().playSfx("sip", 0.5);
    setCoffeeClicks((c) => {
      const n = c + 1;
      if (n >= 10) setCoffeeHearts(true);
      return n;
    });
  }, []);

  const clickClock = useCallback(() => {
    getAudio().playSfx("tick", 0.8);
    setClockClicks((c) => {
      const n = c + 1;
      if (n === 8) {
        setSecretUnlocked(true);
        getAudio().playSfx("chime");
      }
      return n;
    });
  }, []);

  const clickMonkey = useCallback(() => {
    setMonkeyClicks((c) => {
      const n = c + 1;
      if (n >= 5) {
        setMonkeyAngry(true);
        getAudio().playSfx("angry");
        window.setTimeout(() => setMonkeyAngry(false), 18000);
      } else {
        getAudio().playSfx("monkey", 0.7);
      }
      return n;
    });
  }, []);

  const clickAstronaut = useCallback(() => {
    getAudio().playSfx("chime", 0.4);
    setAstronautWave((n) => n + 1);
  }, []);

  const revealNote = useCallback(() => {
    if (!hiddenNote) {
      setHiddenNote(true);
      getAudio().playSfx("page");
    }
  }, [hiddenNote]);

  const bloomPlant = useCallback(() => {
    setPlantBloom(true);
    getAudio().playSfx("chime", 0.35);
  }, []);

  const bumpIdle = useCallback((ms: number) => {
    setIdleMs((v) => {
      const n = v + ms;
      if (n > 180000 && !roomQuiet) {
        setRoomQuiet(true);
        getAudio().setQuiet(true);
      }
      return n;
    });
  }, [roomQuiet]);

  const resetIdle = useCallback(() => {
    setIdleMs(0);
    if (roomQuiet) {
      setRoomQuiet(false);
      getAudio().setQuiet(false);
    }
  }, [roomQuiet]);

  const setObjectPos = useCallback((id: string, pos: Partial<ObjectPos>) => {
    setPositions((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...pos },
    }));
  }, []);

  const setMusicVolume = useCallback((v: number) => {
    setMusicVol(v);
    getAudio().setMusicVolume(v);
  }, []);
  const setAmbienceVolume = useCallback((v: number) => {
    setAmbVol(v);
    getAudio().setAmbienceVolume(v);
  }, []);
  const setEffectsVolume = useCallback((v: number) => {
    setFxVol(v);
    getAudio().setEffectsVolume(v);
  }, []);

  const value = useMemo<WorldValue>(
    () => ({
      phase,
      setPhase,
      radioOn,
      playing,
      frequency,
      station,
      tuned,
      trackIndex,
      transitioning,
      secretUnlocked,
      coffeeLevel,
      coffeeHearts,
      coffeeClicks,
      clockClicks,
      monkeyClicks,
      monkeyAngry,
      astronautWave,
      hiddenNote,
      plantBloom,
      roomQuiet,
      idleMs,
      panel,
      setPanel,
      positions,
      setObjectPos,
      pointer,
      setPointer,
      musicVolume,
      ambienceVolume,
      effectsVolume,
      setMusicVolume,
      setAmbienceVolume,
      setEffectsVolume,
      enterRoom,
      togglePower,
      togglePlay,
      nextTrack,
      prevTrack,
      setFrequency,
      tuneToStation,
      sipCoffee,
      clickCoffee,
      clickClock,
      clickMonkey,
      clickAstronaut,
      revealNote,
      bloomPlant,
      bumpIdle,
      resetIdle,
      brand: COPY,
    }),
    [
      ambienceVolume,
      astronautWave,
      bloomPlant,
      bumpIdle,
      clickAstronaut,
      clickClock,
      clickCoffee,
      clickMonkey,
      clockClicks,
      coffeeClicks,
      coffeeHearts,
      coffeeLevel,
      effectsVolume,
      enterRoom,
      frequency,
      hiddenNote,
      idleMs,
      monkeyAngry,
      monkeyClicks,
      musicVolume,
      nextTrack,
      panel,
      phase,
      plantBloom,
      playing,
      pointer,
      positions,
      prevTrack,
      radioOn,
      resetIdle,
      revealNote,
      roomQuiet,
      secretUnlocked,
      setAmbienceVolume,
      setEffectsVolume,
      setFrequency,
      setMusicVolume,
      setObjectPos,
      sipCoffee,
      station,
      togglePlay,
      togglePower,
      trackIndex,
      transitioning,
      tuneToStation,
      tuned,
    ],
  );

  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>;
}

export function useWorld() {
  const ctx = useContext(WorldContext);
  if (!ctx) throw new Error("useWorld must be used within WorldProvider");
  return ctx;
}
