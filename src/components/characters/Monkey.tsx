"use client";

import { useEffect, useRef, useState } from "react";
import { pickBehavior, randomDuration } from "@/systems/CharacterSystem";
import { useWorld } from "@/context/WorldContext";
import type { MonkeyState } from "@/types/world";

const WAYPOINTS = [
  { x: 42, y: 70 },
  { x: 58, y: 52 },
  { x: 76, y: 66 },
  { x: 30, y: 76 },
  { x: 50, y: 82 },
  { x: 20, y: 58 },
  { x: 68, y: 74 },
  { x: 48, y: 48 },
];

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

type View = {
  x: number;
  y: number;
  state: MonkeyState;
  facing: number;
};

export function Monkey() {
  const { pointer, monkeyAngry, idleMs, clickMonkey, station } = useWorld();
  const [view, setView] = useState<View>({ x: 40, y: 72, state: "idle", facing: 1 });
  const pointerRef = useRef(pointer);
  const angryRef = useRef(false);
  const idleRef = useRef(0);
  const sim = useRef({
    x: 40,
    y: 72,
    state: "idle" as MonkeyState,
    facing: 1,
    tx: 40,
    ty: 72,
    thinkAt: 0,
  });

  useEffect(() => {
    pointerRef.current = pointer;
  }, [pointer]);

  useEffect(() => {
    angryRef.current = monkeyAngry;
  }, [monkeyAngry]);

  useEffect(() => {
    idleRef.current = idleMs;
  }, [idleMs]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    sim.current.thinkAt = last + 2400;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = sim.current;

      if (angryRef.current) {
        s.state = "angry";
        s.tx = 112;
        s.ty = 40;
      } else if (idleRef.current > 60000 && s.state !== "sleeping") {
        s.state = "sleeping";
      }

      const dx = s.tx - s.x;
      const dy = s.ty - s.y;
      const dist = Math.hypot(dx, dy);
      const speed = s.state === "running" || s.state === "angry" ? 28 : s.state === "walking" || s.state === "hiding" ? 11 : 0;

      if (speed && dist > 0.6) {
        s.x += (dx / dist) * speed * dt;
        s.y += (dy / dist) * speed * dt;
        s.facing = dx >= 0 ? 1 : -1;
      } else if ((s.state === "walking" || s.state === "running" || s.state === "hiding") && dist <= 0.6) {
        s.state = s.state === "hiding" ? "idle" : pick(["idle", "sitting", "looking"] as MonkeyState[]);
        s.thinkAt = now + 1800;
      }

      if (s.state === "looking") {
        s.facing = pointerRef.current.x >= s.x ? 1 : -1;
      }

      if (now > s.thinkAt && s.state !== "angry" && s.state !== "sleeping") {
        const behavior = pickBehavior(s.state);
        s.state = behavior.state;
        s.thinkAt = now + randomDuration(behavior);
        if (behavior.state === "walking" || behavior.state === "running") {
          const w = pick(WAYPOINTS);
          s.tx = w.x;
          s.ty = w.y;
        } else if (behavior.state === "sitting") {
          s.tx = Math.random() < 0.5 ? 76 : 50;
          s.ty = Math.random() < 0.5 ? 64 : 52;
        } else if (behavior.state === "interacting") {
          s.tx = 50;
          s.ty = 50;
        } else if (behavior.state === "hiding") {
          s.tx = 12;
          s.ty = 44;
        }
      }

      setView({ x: s.x, y: s.y, state: s.state, facing: s.facing });
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const lookX = pointer.x - view.x;
  const climb = view.state === "interacting";

  return (
    <button
      type="button"
      className={`monkey st-${view.state} theme-${station.theme}`}
      style={{
        left: `${view.x}%`,
        top: `${climb ? view.y - 8 : view.y}%`,
        transform: `translate(-50%, -50%) scaleX(${view.facing})`,
        opacity: view.state === "hiding" ? 0.18 : 1,
      }}
      onClick={clickMonkey}
      aria-label="Monkey"
    >
      <svg viewBox="0 0 64 72" width="64" height="72">
        <ellipse cx="32" cy="66" rx="14" ry="4" fill="rgba(0,0,0,.22)" />
        <path d="M14 40c-8 10-6 22 6 24 4 8 20 8 24 0 12-2 14-14 6-24" fill="#6b3f24" />
        <path d="M22 44c2 10 18 10 20 0" fill="#c48a62" />
        <circle cx="16" cy="22" r="10" fill="#6b3f24" />
        <circle cx="48" cy="22" r="10" fill="#6b3f24" />
        <circle cx="16" cy="22" r="6" fill="#e2b089" />
        <circle cx="48" cy="22" r="6" fill="#e2b089" />
        <ellipse cx="32" cy="26" rx="16" ry="15" fill="#7a4a2b" />
        <ellipse cx="32" cy="30" rx="11" ry="10" fill="#e8b890" />
        <circle
          cx={view.state === "looking" ? 26 + Math.sign(lookX) * 2 : 26}
          cy={view.state === "sleeping" ? 28 : 27}
          r="2.2"
          fill={view.state === "sleeping" ? "transparent" : "#1a120c"}
        />
        <circle
          cx={view.state === "looking" ? 38 + Math.sign(lookX) * 2 : 38}
          cy={view.state === "sleeping" ? 28 : 27}
          r="2.2"
          fill={view.state === "sleeping" ? "transparent" : "#1a120c"}
        />
        {view.state === "sleeping" && (
          <>
            <path d="M22 28c3 2 6 2 9 0" stroke="#1a120c" fill="none" strokeWidth="1.4" />
            <path d="M33 28c3 2 6 2 9 0" stroke="#1a120c" fill="none" strokeWidth="1.4" />
          </>
        )}
        <ellipse cx="32" cy="34" rx="3.2" ry="2.2" fill="#c47a5a" />
        <path
          className="tail"
          d="M18 48c-12 2-16 16-8 22"
          fill="none"
          stroke="#6b3f24"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {view.state === "angry" && <path d="M22 22l6 4M42 22l-6 4" stroke="#4a1c12" strokeWidth="2" />}
      </svg>
      {view.state === "sleeping" && <span className="zzz">z</span>}
    </button>
  );
}
