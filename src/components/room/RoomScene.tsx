"use client";

import { AnalogClock } from "@/components/objects/AnalogClock";
import { CoffeeCup } from "@/components/objects/CoffeeCup";
import {
  DeskLamp,
  DeskObjects,
  HiddenNote,
  NowPlayingNote,
} from "@/components/objects/DeskObjects";
import { Astronaut } from "@/components/characters/Astronaut";
import { Monkey } from "@/components/characters/Monkey";
import { VintageRadio } from "@/components/radio/VintageRadio";
import { DustParticles, GrainOverlay, WindowView } from "@/components/room/Atmosphere";
import { AboutPanel, CornerControls, SoundPanel, StationsPanel } from "@/components/ui/Panels";
import { useWorld } from "@/context/WorldContext";
import { useIdleWatcher } from "@/hooks/useDrag";

export function RoomScene() {
  const { station, transitioning, roomQuiet, setPointer, resetIdle } = useWorld();
  useIdleWatcher();

  return (
    <div
      className={`world theme-${station.theme} ${transitioning ? "is-tuning" : ""} ${roomQuiet ? "is-quiet" : ""}`}
    >
      <div
        className="room"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPointer({
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100,
          });
        }}
        onPointerDown={() => resetIdle()}
      >
        <div className="wall-paper" />
        <WindowView />
        <div className="desk-wood" />
        <DeskLamp />
        <HiddenNote />
        <DeskObjects />
        <VintageRadio />
        <AnalogClock />
        <CoffeeCup />
        <NowPlayingNote />
        <Monkey />
        <Astronaut />
        <DustParticles />
        <div className="vignette" />
        <GrainOverlay />
        <div className="tune-veil" />
      </div>
      <CornerControls />
      <AboutPanel />
      <StationsPanel />
      <SoundPanel />
      <p className="floor-slogan">Keyif yaln\u0131z gitmez.</p>
    </div>
  );
}
