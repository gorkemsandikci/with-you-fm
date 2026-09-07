import type { MonkeyState } from "@/types/world";

export type CharacterBehavior = {
  state: MonkeyState;
  minMs: number;
  maxMs: number;
};

const CALM: CharacterBehavior[] = [
  { state: "idle", minMs: 1800, maxMs: 4000 },
  { state: "walking", minMs: 2200, maxMs: 5000 },
  { state: "sitting", minMs: 2400, maxMs: 5200 },
  { state: "looking", minMs: 1600, maxMs: 3200 },
  { state: "interacting", minMs: 1800, maxMs: 3000 },
  { state: "running", minMs: 900, maxMs: 1600 },
  { state: "hiding", minMs: 2500, maxMs: 5000 },
];

export function pickBehavior(exclude?: MonkeyState): CharacterBehavior {
  const pool = CALM.filter((b) => b.state !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function randomDuration(b: CharacterBehavior) {
  return b.minMs + Math.random() * (b.maxMs - b.minMs);
}
