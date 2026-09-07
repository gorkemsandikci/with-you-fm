"use client";

import { InteractiveObject } from "@/components/InteractiveObject";
import { useWorld } from "@/context/WorldContext";

export function DeskObjects() {
  const { plantBloom, bloomPlant, station } = useWorld();
  const faded = station.theme === "gecmiste" || station.theme === "nostalji";

  return (
    <>
      <InteractiveObject id="notebook" className="notebook-wrap" z={5}>
        <div className="notebook">
          <div className="notebook-spiral" />
          <p>88 / stay</p>
          <p>do not rush the song</p>
        </div>
      </InteractiveObject>

      <InteractiveObject id="cassette" className="tape-wrap" z={6}>
        <div className="tape">
          <div className="reel" />
          <div className="reel" />
          <span>SIDE A</span>
        </div>
      </InteractiveObject>

      <InteractiveObject id="cassette2" className="tape-wrap tape-b" z={6}>
        <div className="tape darker">
          <div className="reel" />
          <div className="reel" />
          <span>SIDE B</span>
        </div>
      </InteractiveObject>

      <InteractiveObject id="headphones" className="hp-wrap" z={7}>
        <div className="headphones">
          <div className="hp-band" />
          <div className="hp-cup left" />
          <div className="hp-cup right" />
        </div>
      </InteractiveObject>

      <InteractiveObject id="photo1" className="photo-wrap" z={5}>
        <div className={`polaroid ${faded ? "faded" : ""}`}>
          <div className="photo-art p1" />
          <em>july</em>
        </div>
      </InteractiveObject>
      <InteractiveObject id="photo2" className="photo-wrap" z={5}>
        <div className={`polaroid ${faded ? "faded" : ""}`}>
          <div className="photo-art p2" />
          <em>us</em>
        </div>
      </InteractiveObject>
      <InteractiveObject id="photo3" className="photo-wrap" z={5}>
        <div className={`polaroid ${faded ? "faded" : ""}`}>
          <div className="photo-art p3" />
          <em>night bus</em>
        </div>
      </InteractiveObject>

      <InteractiveObject id="toy" className="toy-wrap" z={6}>
        <div className="tiny-car" aria-hidden />
      </InteractiveObject>

      <div className={`plant ${plantBloom ? "bloom" : ""}`} onClick={bloomPlant}>
        <div className="pot" />
        <div className="leaf l1" />
        <div className="leaf l2" />
        <div className="leaf l3" />
        {plantBloom && (
          <>
            <i className="flower f1" />
            <i className="flower f2" />
          </>
        )}
      </div>
    </>
  );
}

export function NowPlayingNote() {
  const { station, trackIndex, playing, prevTrack, togglePlay, nextTrack, radioOn } = useWorld();
  const track = station.playlist[trackIndex];

  return (
    <InteractiveObject id="nowplaying" className="np-wrap" z={11}>
      <div className="now-playing">
        <p className="np-kicker">NOW PLAYING</p>
        <p className="np-artist">{track.artist}</p>
        <p className="np-title">{track.title}</p>
        <p className="np-st">
          {station.name} — {station.frequency} FM
        </p>
        <div className="np-controls">
          <button type="button" onClick={prevTrack} aria-label="Previous">
            ‹
          </button>
          <button type="button" onClick={togglePlay} aria-label="Play pause">
            {playing && radioOn ? "II" : "▶"}
          </button>
          <button type="button" onClick={nextTrack} aria-label="Next">
            ›
          </button>
        </div>
      </div>
    </InteractiveObject>
  );
}

export function HiddenNote() {
  const { hiddenNote, secretUnlocked } = useWorld();
  if (!hiddenNote) return null;
  return (
    <div className="hidden-note">
      {secretUnlocked
        ? "111 FM is awake. Turn the dial a little further."
        : "Eight ticks of the clock, if you are curious."}
    </div>
  );
}

export function DeskLamp() {
  const { station, radioOn } = useWorld();
  const on = station.theme !== "gece" || radioOn;
  return (
    <div className={`lamp ${on ? "on" : ""}`}>
      <div className="lamp-arm" />
      <div className="lamp-head" />
      <div className="lamp-glow" />
      <div className="lamp-base" />
    </div>
  );
}
