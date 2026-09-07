"use client";

import { PUBLIC_STATIONS, STATIONS } from "@/data/stations";
import { useWorld } from "@/context/WorldContext";

export function CornerControls() {
  const { setPanel, panel } = useWorld();
  const toggle = (id: "about" | "stations" | "sound") =>
    setPanel(panel === id ? null : id);

  return (
    <nav className="corners">
      <button type="button" className="corner tl" onClick={() => toggle("about")}>
        ABOUT
      </button>
      <button type="button" className="corner tr" onClick={() => toggle("stations")}>
        STATIONS
      </button>
      <button type="button" className="corner bl" onClick={() => toggle("sound")}>
        SOUND
      </button>
    </nav>
  );
}

export function AboutPanel() {
  const { panel, setPanel, brand } = useWorld();
  if (panel !== "about") return null;
  return (
    <div className="paper-panel" onClick={() => setPanel(null)}>
      <article onClick={(e) => e.stopPropagation()}>
        <h2>{brand.brand}</h2>
        {brand.aboutBody.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <button type="button" onClick={() => setPanel(null)}>
          fold back
        </button>
      </article>
    </div>
  );
}

export function StationsPanel() {
  const { panel, setPanel, station, secretUnlocked, tuneToStation } = useWorld();
  if (panel !== "stations") return null;
  const list = secretUnlocked ? STATIONS : PUBLIC_STATIONS;
  return (
    <div className="paper-panel" onClick={() => setPanel(null)}>
      <article className="station-list" onClick={(e) => e.stopPropagation()}>
        <h2>frequencies</h2>
        {list.map((s) => (
          <button
            type="button"
            key={s.id}
            className={s.id === station.id ? "active" : ""}
            onClick={() => {
              tuneToStation(s.id);
              setPanel(null);
            }}
          >
            <b>{s.frequency}</b>
            <span>{s.name}</span>
            <em>{s.nameEn}</em>
          </button>
        ))}
      </article>
    </div>
  );
}

export function SoundPanel() {
  const {
    panel,
    setPanel,
    musicVolume,
    ambienceVolume,
    effectsVolume,
    setMusicVolume,
    setAmbienceVolume,
    setEffectsVolume,
  } = useWorld();
  if (panel !== "sound") return null;
  return (
    <div className="paper-panel" onClick={() => setPanel(null)}>
      <article className="sound-card" onClick={(e) => e.stopPropagation()}>
        <h2>sound</h2>
        <label>
          music
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={musicVolume}
            onChange={(e) => setMusicVolume(Number(e.target.value))}
          />
        </label>
        <label>
          room
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={ambienceVolume}
            onChange={(e) => setAmbienceVolume(Number(e.target.value))}
          />
        </label>
        <label>
          little noises
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={effectsVolume}
            onChange={(e) => setEffectsVolume(Number(e.target.value))}
          />
        </label>
        <button type="button" onClick={() => setPanel(null)}>
          close
        </button>
      </article>
    </div>
  );
}
