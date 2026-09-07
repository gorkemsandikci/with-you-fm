"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { getAudio } from "@/systems/AudioSystem";
import { useWorld } from "@/context/WorldContext";

type Props = {
  id: string;
  className?: string;
  draggable?: boolean;
  z?: number;
  onClick?: () => void;
  onHover?: (h: boolean) => void;
  children: ReactNode;
  style?: CSSProperties;
};

export function InteractiveObject({
  id,
  className = "",
  draggable = true,
  z = 4,
  onClick,
  onHover,
  children,
  style,
}: Props) {
  const { positions, setObjectPos, resetIdle, revealNote } = useWorld();
  const pos = positions[id];
  const [hover, setHover] = useState(false);
  const [drag, setDrag] = useState(false);
  const dragRef = useRef(false);
  const moved = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const room = document.querySelector(".room");
      if (!room) return;
      moved.current = true;
      const r = room.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100 - offset.current.x;
      const y = ((e.clientY - r.top) / r.height) * 100 - offset.current.y;
      setObjectPos(id, {
        x: Math.min(93, Math.max(7, x)),
        y: Math.min(90, Math.max(12, y)),
      });
    };
    const up = () => {
      if (!dragRef.current) return;
      dragRef.current = false;
      setDrag(false);
      if (moved.current) getAudio().playSfx("drop", 0.32);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [id, setObjectPos]);

  if (!pos) return null;

  return (
    <div
      className={`iobj ${className} ${hover ? "is-hover" : ""} ${drag ? "is-drag" : ""}`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        zIndex: drag ? 42 : z,
        transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`,
        ...style,
      }}
      onPointerDown={(e) => {
        if (!draggable) return;
        e.stopPropagation();
        resetIdle();
        const room = document.querySelector(".room");
        if (!room) return;
        const r = room.getBoundingClientRect();
        offset.current = {
          x: ((e.clientX - r.left) / r.width) * 100 - pos.x,
          y: ((e.clientY - r.top) / r.height) * 100 - pos.y,
        };
        dragRef.current = true;
        moved.current = false;
        setDrag(true);
        if (id === "radio") revealNote();
      }}
      onPointerEnter={() => {
        setHover(true);
        onHover?.(true);
      }}
      onPointerLeave={() => {
        setHover(false);
        onHover?.(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (moved.current) return;
        resetIdle();
        onClick?.();
      }}
    >
      {children}
    </div>
  );
}
