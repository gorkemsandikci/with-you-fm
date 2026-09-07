"use client";

import { useEffect, useState } from "react";
import { useWorld } from "@/context/WorldContext";

export function Astronaut() {
  const { clickAstronaut, astronautWave } = useWorld();
  const [visible, setVisible] = useState(false);
  const [pose, setPose] = useState<"float" | "sit" | "walk" | "gone">("gone");
  const [pos, setPos] = useState({ x: 70, y: 24 });
  const waving = astronautWave > 0;

  useEffect(() => {
    let live = true;
    const schedule = () => {
      const wait = 18000 + Math.random() * 40000;
      window.setTimeout(() => {
        if (!live) return;
        setVisible(true);
        setPose(Math.random() < 0.5 ? "float" : "walk");
        setPos({
          x: 10 + Math.random() * 75,
          y: 18 + Math.random() * 55,
        });
        window.setTimeout(() => {
          if (!live) return;
          setPose("sit");
        }, 4000);
        window.setTimeout(() => {
          if (!live) return;
          setVisible(false);
          setPose("gone");
          schedule();
        }, 11000);
      }, wait);
    };
    const first = window.setTimeout(() => {
      setVisible(true);
      setPose("float");
      schedule();
    }, 14000);
    return () => {
      live = false;
      window.clearTimeout(first);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className={`astro pose-${pose} ${waving ? "wave" : ""}`}
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      onClick={clickAstronaut}
      aria-label="Astronaut"
    >
      <svg viewBox="0 0 40 52" width="40" height="52">
        <ellipse cx="20" cy="48" rx="8" ry="2.4" fill="rgba(0,0,0,.2)" />
        <rect x="13" y="22" width="14" height="16" rx="4" fill="#e8e0d2" />
        <circle cx="20" cy="16" r="9" fill="#f3eee4" />
        <ellipse cx="20" cy="16" rx="6" ry="5" fill="#1c2a44" />
        <rect x="9" y="24" width="5" height="10" rx="2" fill="#d9d0c2" />
        <rect
          x="26"
          y="24"
          width="5"
          height="10"
          rx="2"
          fill="#d9d0c2"
          className="astro-arm"
        />
        <rect x="14" y="36" width="5" height="10" rx="2" fill="#cfc6b8" />
        <rect x="21" y="36" width="5" height="10" rx="2" fill="#cfc6b8" />
        <circle cx="20" cy="28" r="1.4" fill="#c45c2a" />
      </svg>
    </button>
  );
}
