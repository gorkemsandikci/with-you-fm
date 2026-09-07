"use client";

import { useEffect, useRef } from "react";
import { InteractiveObject } from "@/components/InteractiveObject";
import { useWorld } from "@/context/WorldContext";

export function VintageRadio() {
  const {
    radioOn,
    playing,
    frequency,
    station,
    tuned,
    togglePower,
    togglePlay,
    setFrequency,
    secretUnlocked,
  } = useWorld();
  const lastAngle = useRef<number | null>(null);
  const knob = useRef<HTMLButtonElement>(null);
  const freqRef = useRef(frequency);

  useEffect(() => {
    freqRef.current = frequency;
  }, [frequency]);

  const onDial = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const el = knob.current;
    if (!el) return;
    const pointerId = e.pointerId;
    el.setPointerCapture(pointerId);
    const angleAt = (ev: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return Math.atan2(ev.clientY - (r.top + r.height / 2), ev.clientX - (r.left + r.width / 2));
    };
    lastAngle.current = angleAt(e.nativeEvent);
    const move = (ev: PointerEvent) => {
      const a = angleAt(ev);
      if (lastAngle.current == null) {
        lastAngle.current = a;
        return;
      }
      let d = a - lastAngle.current;
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      lastAngle.current = a;
      const max = secretUnlocked ? 111.6 : 108.8;
      const next = Math.min(max, Math.max(87.5, freqRef.current + d * 4.2));
      setFrequency(next, true);
    };
    const up = () => {
      lastAngle.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const rot = ((frequency - 87.5) / (111.6 - 87.5)) * 280 - 140;

  return (
    <InteractiveObject id="radio" className="radio-wrap" z={8}>
      <div className={`radio ${radioOn ? "is-on" : ""} ${playing ? "is-live" : ""} ${tuned ? "is-tuned" : "is-static"}`}>
        <div className="radio-shadow" />
        <div className="radio-body">
          <div className="radio-handle" />
          <div className="radio-face">
            <div className="radio-window">
              <div className="radio-lcd">
                <span className="radio-freq">{frequency.toFixed(1)}</span>
                <span className="radio-band">FM</span>
              </div>
              <div className="radio-station">{tuned ? station.name : "····"}</div>
            </div>
            <div className="radio-scale">
              <span>88</span>
              <span>94</span>
              <span>100</span>
              <span>108</span>
              <i className="radio-needle" style={{ left: `${((frequency - 87.5) / 24.1) * 100}%` }} />
            </div>
            <div className="radio-row">
              <button
                type="button"
                className={`radio-knob power ${radioOn ? "on" : ""}`}
                aria-label="Power"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePower();
                }}
              >
                <b />
              </button>
              <div className={`speaker ${playing ? "throb" : ""}`} aria-hidden>
                <span />
                <span />
                <span />
              </div>
              <button
                type="button"
                ref={knob}
                className="radio-knob dial"
                aria-label="Tune"
                style={{ transform: `rotate(${rot}deg)` }}
                onPointerDown={onDial}
              >
                <i />
              </button>
            </div>
            <div className="radio-bottom">
              <button
                type="button"
                className="radio-play"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
              >
                {playing && radioOn ? "PAUSE" : "D\u0130NLE"}
              </button>
              <span className={`status-lamp ${radioOn ? "on" : ""} ${playing ? "pulse" : ""}`} />
            </div>
          </div>
        </div>
      </div>
    </InteractiveObject>
  );
}
