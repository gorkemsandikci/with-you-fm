"use client";

import { useEffect, useRef, useState } from "react";
import { InteractiveObject } from "@/components/InteractiveObject";
import { useWorld } from "@/context/WorldContext";
import { getAudio } from "@/systems/AudioSystem";

export function AnalogClock() {
  const { pointer, positions, clickClock, setObjectPos } = useWorld();
  const [now, setNow] = useState(() => new Date());
  const lastSec = useRef(now.getSeconds());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const s = now.getSeconds();
    if (s === lastSec.current) return;
    lastSec.current = s;
    const pos = positions.clock;
    if (!pos) return;
    const dist = Math.hypot(pointer.x - pos.x, pointer.y - pos.y);
    if (dist < 14) getAudio().playSfx("tick", 0.25 + (14 - dist) / 40);
  }, [now, pointer.x, pointer.y, positions.clock]);

  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();
  const hourA = h * 30 + m * 0.5;
  const minA = m * 6 + s * 0.1;
  const secA = s * 6;

  return (
    <InteractiveObject id="clock" className="clock-wrap" z={9} onClick={clickClock}>
      <div className="clock">
        <div className="clock-bells">
          <b />
          <b />
        </div>
        <div className="clock-face">
          {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => (
            <span key={n} className="tick-mark" style={{ transform: `rotate(${i * 30}deg)` }} />
          ))}
          <i className="hand hour" style={{ transform: `rotate(${hourA}deg)` }} />
          <i className="hand minute" style={{ transform: `rotate(${minA}deg)` }} />
          <i className="hand second" style={{ transform: `rotate(${secA}deg)` }} />
          <em className="clock-cap" />
        </div>
        <button
          type="button"
          className="clock-rot"
          aria-label="Rotate clock"
          onPointerDown={(e) => {
            e.stopPropagation();
            const startY = e.clientY;
            const start = positions.clock.rotation;
            const move = (ev: PointerEvent) => {
              setObjectPos("clock", { rotation: start + (ev.clientY - startY) * 0.4 });
            };
            const up = () => {
              window.removeEventListener("pointermove", move);
              window.removeEventListener("pointerup", up);
            };
            window.addEventListener("pointermove", move);
            window.addEventListener("pointerup", up);
          }}
        />
      </div>
    </InteractiveObject>
  );
}
