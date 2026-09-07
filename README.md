# WITH YOU FM

Interactive on-demand radio. The browser is a small illustrated room, not a music dashboard.

**Keyif yalniz gitmez.**  
Music is better with you.

## Run

```bash
cd C:\Users\gorke\projects\with-you-fm
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

Regenerate prototype audio (royalty-free synthesized loops):

```bash
npm run generate-audio
```

## How to listen

1. Wait through the tuning screen.
2. Click **DINLE**.
3. Drag the radio dial. Static plays between stations.
4. When a frequency locks, the room atmosphere and playlist change.

Drag objects around the desk. They keep their place for the current session.

## Stations

| FM  | Name      | Mood        |
| --- | --------- | ----------- |
| 88  | EVDE TEK  | Quiet night |
| 91  | GECMISTE  | In the past |
| 94  | YAGMUR    | Rain        |
| 97  | GECE      | Night       |
| 100 | YOLDA     | On the road |
| 103 | MUTLU     | Happy       |
| 105 | NOSTALJI  | Nostalgia   |
| 108 | SAKIN     | Calm        |
| 111 | GIZLI     | Hidden      |

111 FM is locked until you find it.

Add more stations in `src/data/stations.ts`. The radio, scene, and audio systems are built so playlists can grow later.

## Hidden things

- Click the monkey 5 times.
- Click the astronaut.
- Click the clock 8 times.
- Drag the radio.
- Click the coffee cup 10 times. Hold the cup to change the coffee level.
- Click the plant.
- Stay idle for about a minute. Stay idle a few minutes more.

## Stack

Next.js, TypeScript, React, Framer Motion, Howler.js.

| Path | Role |
| --- | --- |
| `src/data/stations.ts` | Stations and copy |
| `src/systems/AudioSystem.ts` | Music, ambience, effects |
| `src/systems/RadioSystem.ts` | Frequency locking |
| `src/systems/SceneSystem.ts` | Atmosphere |
| `src/systems/CharacterSystem.ts` | Monkey behaviors |
| `src/context/WorldContext.tsx` | Room state |
| `src/components/room/RoomScene.tsx` | Illustrated desk |
| `public/audio/` | Generated demo audio |

Prototype tracks are original synthesized loops, not commercial songs.
