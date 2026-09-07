"use client";

import { useRef } from "react";
import { InteractiveObject } from "@/components/InteractiveObject";
import { useWorld } from "@/context/WorldContext";
import { getAudio } from "@/systems/AudioSystem";

export function CoffeeCup() {
  const { coffeeLevel, coffeeHearts, sipCoffee, clickCoffee } = useWorld();
  const hold = useRef<number | null>(null);
  const filling = useRef(false);

  const startHold = (e: React.PointerEvent) => {
    e.stopPropagation();
    filling.current = coffeeLevel < 12;
    getAudio().playSfx(filling.current ? "steam" : "sip", 0.55);
    const step = () => {
      sipCoffee(filling.current ? 1.4 : -1.1);
    };
    step();
    hold.current = window.setInterval(step, 80);
  };

  const stopHold = () => {
    if (hold.current) window.clearInterval(hold.current);
    hold.current = null;
  };

  return (
    <InteractiveObject id="coffee" className="coffee-wrap" z={10} onClick={clickCoffee}>
      <div className={`coffee ${coffeeHearts ? "hearts" : ""}`}>
        <div className="steam">
          <span />
          <span />
          <span />
        </div>
        <div
          className="cup"
          onPointerDown={startHold}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
        >
          <div className="cup-inner">
            <div className="coffee-liquid" style={{ height: `${coffeeLevel}%` }} />
            <div className="coffee-shine" />
          </div>
          <div className="cup-handle" />
        </div>
        <div className="saucer" />
      </div>
    </InteractiveObject>
  );
}
