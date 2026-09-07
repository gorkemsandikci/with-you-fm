import type { Station } from "@/types/world";

const t = (
  id: string,
  title: string,
  artist: string,
  file: string,
): Station["playlist"][number] => ({
  id,
  title,
  artist,
  src: `/audio/music/${file}.wav`,
  duration: 16,
});

export const STATIONS: Station[] = [
  {
    id: "evde-tek",
    frequency: 88,
    name: "EVDE TEK",
    nameEn: "Home Alone",
    description: "A quiet room. The lamp is still on.",
    ambience: "room-night",
    theme: "evde-tek",
    window: "night",
    playlist: [
      t("et-1", "The Lamp Is Still On", "Kitchen Window", "evde-tek-1"),
      t("et-2", "Second Cup", "Late Floorboards", "evde-tek-2"),
    ],
  },
  {
    id: "gecmiste",
    frequency: 91,
    name: "GE\u00c7M\u0130\u015eTE",
    nameEn: "In the Past",
    description: "Faded photographs and tape hiss.",
    ambience: "tape-hiss",
    theme: "gecmiste",
    window: "sepia",
    playlist: [
      t("gp-1", "Old Photographs", "Paper Moon", "gecmiste-1"),
      t("gp-2", "The Drawer You Never Open", "Second Floor", "gecmiste-2"),
    ],
  },
  {
    id: "yagmur",
    frequency: 94,
    name: "YA\u011eMUR",
    nameEn: "Rain",
    description: "Rain on the glass. Stay inside.",
    ambience: "rain",
    theme: "yagmur",
    window: "rain",
    playlist: [
      t("yg-1", "Rain on the Glass", "Window Seat", "yagmur-1"),
      t("yg-2", "Umbrella by the Door", "Soft Thunder", "yagmur-2"),
    ],
  },
  {
    id: "gece",
    frequency: 97,
    name: "GECE",
    nameEn: "Night",
    description: "City lights far away. The room is dark.",
    ambience: "city-night",
    theme: "gece",
    window: "city",
    playlist: [
      t("gc-1", "After Midnight Tram", "Blue Balcony", "gece-1"),
      t("gc-2", "Moon on the Desk", "Quiet Roof", "gece-2"),
    ],
  },
  {
    id: "yolda",
    frequency: 100,
    name: "YOLDA",
    nameEn: "On the Road",
    description: "Something moving outside the window.",
    ambience: "travel",
    theme: "yolda",
    window: "road",
    playlist: [
      t("yl-1", "Between Two Towns", "Night Bus", "yolda-1"),
      t("yl-2", "Map Folded Wrong", "Open Window", "yolda-2"),
    ],
  },
  {
    id: "mutlu",
    frequency: 103,
    name: "MUTLU",
    nameEn: "Happy",
    description: "Gold light. Someone left a note.",
    ambience: "warm-day",
    theme: "mutlu",
    window: "golden",
    playlist: [
      t("mt-1", "Sunday Oranges", "Bright Kettle", "mutlu-1"),
      t("mt-2", "The Long Way Home", "Yellow Radio", "mutlu-2"),
    ],
  },
  {
    id: "nostalji",
    frequency: 105,
    name: "NOSTALJ\u0130",
    nameEn: "Nostalgia",
    description: "A cassette that still works.",
    ambience: "vinyl-room",
    theme: "nostalji",
    window: "film",
    playlist: [
      t("ns-1", "Side B, Track 3", "Dust & Ribbon", "nostalji-1"),
      t("ns-2", "Handwriting on the Case", "Mixtape Club", "nostalji-2"),
    ],
  },
  {
    id: "sakin",
    frequency: 108,
    name: "SAK\u0130N",
    nameEn: "Calm",
    description: "Slow air. Nothing asks for you.",
    ambience: "soft-wind",
    theme: "sakin",
    window: "fog",
    playlist: [
      t("sk-1", "Nothing Asks for You", "Still Room", "sakin-1"),
      t("sk-2", "Leaves Without Wind", "Quiet Plant", "sakin-2"),
    ],
  },
  {
    id: "gizli",
    frequency: 111,
    name: "G\u0130ZL\u0130",
    nameEn: "Hidden",
    description: "You were not supposed to find this yet.",
    ambience: "secret",
    theme: "gizli",
    window: "secret",
    secret: true,
    playlist: [t("gz-1", "Left Under the Radio", "Unknown Sender", "gizli-1")],
  },
];

export const PUBLIC_STATIONS = STATIONS.filter((s) => !s.secret);
export const MIN_FREQ = 87.5;
export const MAX_FREQ = 111.6;
export const SNAP_DISTANCE = 0.7;

export function getStationById(id: string) {
  return STATIONS.find((s) => s.id === id) ?? STATIONS[0];
}

export function nearestStation(frequency: number, allowSecret: boolean) {
  const pool = allowSecret ? STATIONS : PUBLIC_STATIONS;
  let best = pool[0];
  let bestDist = Math.abs(frequency - best.frequency);
  for (const s of pool) {
    const d = Math.abs(frequency - s.frequency);
    if (d < bestDist) {
      best = s;
      bestDist = d;
    }
  }
  return { station: best, distance: bestDist, locked: bestDist <= SNAP_DISTANCE };
}

export const DEFAULT_POSITIONS: Record<
  string,
  { x: number; y: number; rotation: number }
> = {
  radio: { x: 50, y: 58, rotation: -1.5 },
  clock: { x: 18, y: 62, rotation: 4 },
  coffee: { x: 78, y: 64, rotation: -6 },
  cassette: { x: 22, y: 78, rotation: -12 },
  cassette2: { x: 28, y: 82, rotation: 8 },
  notebook: { x: 14, y: 46, rotation: -8 },
  headphones: { x: 82, y: 46, rotation: 12 },
  photo1: { x: 72, y: 28, rotation: -7 },
  photo2: { x: 80, y: 32, rotation: 6 },
  photo3: { x: 75, y: 36, rotation: -2 },
  toy: { x: 36, y: 80, rotation: 10 },
  nowplaying: { x: 64, y: 78, rotation: -3 },
};

export const COPY = {
  brand: "WITH YOU FM",
  slogan: "Keyif yaln\u0131z gitmez.",
  sloganEn: "Music is better with you.",
  listen: "D\u0130NLE",
  play: "PLAY",
  about: "ABOUT",
  stations: "STATIONS",
  sound: "SOUND",
  tuning: "TUNING...",
  nowPlaying: "NOW PLAYING",
  aboutBody: [
    "WITH YOU FM, ruh haline g\u00f6re m\u00fczik se\u00e7en k\u00fc\u00e7\u00fck bir internet radyosu.",
    "Evde tek ba\u015f\u0131na oldu\u011funda.",
    "Gece uyumad\u0131\u011f\u0131nda.",
    "Ya\u011fmur ya\u011farken.",
    "Bir yere giderken.",
    "Ge\u00e7mi\u015fi hat\u0131rlarken.",
    "Keyif yaln\u0131z gitmez.",
  ],
};
