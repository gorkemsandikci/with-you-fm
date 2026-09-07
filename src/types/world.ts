export type AppPhase = "loading" | "intro" | "room";

export type PanelId = "about" | "stations" | "sound" | null;

export type WindowKind =
  | "night"
  | "rain"
  | "city"
  | "road"
  | "sepia"
  | "golden"
  | "fog"
  | "film"
  | "secret";

export type Track = {
  id: string;
  title: string;
  artist: string;
  src: string;
  duration: number;
};

export type Station = {
  id: string;
  frequency: number;
  name: string;
  nameEn: string;
  description: string;
  playlist: Track[];
  ambience: string;
  theme: string;
  window: WindowKind;
  secret?: boolean;
};

export type ObjectPos = {
  x: number;
  y: number;
  rotation: number;
};

export type MonkeyState =
  | "idle"
  | "walking"
  | "sitting"
  | "sleeping"
  | "looking"
  | "interacting"
  | "running"
  | "hiding"
  | "angry";

export type Pointer = {
  x: number;
  y: number;
};
