import type { Station } from "@/types/world";

export type SceneAtmosphere = {
  theme: string;
  window: Station["window"];
  ambience: string;
  transitionMs: number;
};

export function sceneFromStation(station: Station): SceneAtmosphere {
  return {
    theme: station.theme,
    window: station.window,
    ambience: station.ambience,
    transitionMs: 800 + Math.floor(Math.random() * 700),
  };
}
