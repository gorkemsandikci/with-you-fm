import { nearestStation, SNAP_DISTANCE } from "@/data/stations";
import type { Station } from "@/types/world";

export function frequencyToStation(
  frequency: number,
  allowSecret: boolean,
): { station: Station; locked: boolean; distance: number } {
  const result = nearestStation(frequency, allowSecret);
  return {
    station: result.station,
    locked: result.distance <= SNAP_DISTANCE,
    distance: result.distance,
  };
}

export function stationNeedlePercent(frequency: number) {
  return ((frequency - 87.5) / 24.1) * 100;
}
