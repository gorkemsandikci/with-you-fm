"use client";

import { useEffect, useState } from "react";
import { useWorld } from "@/context/WorldContext";

export function WindowView() {
  const { station, transitioning } = useWorld();
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (station.window !== "rain") return;
    const id = window.setInterval(() => {
      if (Math.random() < 0.28) {
        setFlash(true);
        window.setTimeout(() => setFlash(false), 140);
      }
    }, 4000);
    return () => window.clearInterval(id);
  }, [station.window]);

  return (
    <div className={`window-view w-${station.window} ${transitioning ? "dim" : ""} ${flash ? "flash" : ""}`}>
      <div className="curtain left" />
      <div className="pane">
        <div className="sky" />
        <div className="far" />
        <div className="mid" />
        {station.window === "rain" && <div className="rain" />}
        {station.window === "city" && <div className="city" />}
        {station.window === "road" && <div className="road" />}
        {station.window === "night" && <div className="stars" />}
        {station.window === "secret" && <div className="aurora" />}
      </div>
      <div className="curtain right" />
      <div className="sill" />
    </div>
  );
}

export function DustParticles() {
  return (
    <div className="dust" aria-hidden>
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} style={{ ["--i" as string]: i }} />
      ))}
    </div>
  );
}

export function GrainOverlay() {
  return <div className="grain" aria-hidden />;
}
