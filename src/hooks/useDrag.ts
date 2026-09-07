"use client";

import { useEffect, useRef } from "react";
import { getAudio } from "@/systems/AudioSystem";
import { useWorld } from "@/context/WorldContext";

export function useDrag(id: string, options?: { onDrop?: () => void; onMove?: () => void }) {
  const { positions, setObjectPos, resetIdle } = useWorld();
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const room = document.querySelector(".room");
      if (!room) return;
      const r = room.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100 - offset.current.x;
      const y = ((e.clientY - r.top) / r.height) * 100 - offset.current.y;
      setObjectPos(id, {
        x: Math.min(92, Math.max(6, x)),
        y: Math.min(90, Math.max(10, y)),
      });
      options?.onMove?.();
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      getAudio().playSfx("drop", 0.35);
      options?.onDrop?.();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [id, options, setObjectPos]);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resetIdle();
    const room = document.querySelector(".room");
    if (!room) return;
    const r = room.getBoundingClientRect();
    const pos = positions[id];
    const px = ((e.clientX - r.left) / r.width) * 100;
    const py = ((e.clientY - r.top) / r.height) * 100;
    offset.current = { x: px - pos.x, y: py - pos.y };
    dragging.current = true;
  };

  return { onPointerDown, pos: positions[id] };
}

export function useIdleWatcher() {
  const { bumpIdle, resetIdle, phase } = useWorld();

  useEffect(() => {
    if (phase !== "room") return;
    const onAct = () => resetIdle();
    const id = window.setInterval(() => bumpIdle(1000), 1000);
    window.addEventListener("pointerdown", onAct);
    window.addEventListener("pointermove", onAct);
    window.addEventListener("keydown", onAct);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("pointerdown", onAct);
      window.removeEventListener("pointermove", onAct);
      window.removeEventListener("keydown", onAct);
    };
  }, [bumpIdle, phase, resetIdle]);
}
