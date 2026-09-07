"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useWorld } from "@/context/WorldContext";

export function LoadingScreen() {
  const { setPhase } = useWorld();
  const [freq, setFreq] = useState(88.0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 2400);
      setFreq(88 + t * 20);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDone(true);
    };
    raf = requestAnimationFrame(tick);
    const later = window.setTimeout(() => setPhase("intro"), 3200);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(later);
    };
  }, [setPhase]);

  return (
    <div className="boot">
      <div className="boot-grain" />
      <motion.p className="boot-kicker" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }}>
        TUNING...
      </motion.p>
      <div className="boot-freq">{freq.toFixed(1)}</div>
      <div className="boot-bar">
        <span style={{ width: `${((freq - 88) / 20) * 100}%` }} />
      </div>
      <p className={`boot-logo ${done ? "is-on" : ""}`}>WITH YOU FM</p>
    </div>
  );
}
