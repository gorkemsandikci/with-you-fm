"use client";

import { WorldProvider, useWorld } from "@/context/WorldContext";
import { IntroScreen } from "@/components/intro/IntroScreen";
import { LoadingScreen } from "@/components/intro/LoadingScreen";
import { RoomScene } from "@/components/room/RoomScene";

function Shell() {
  const { phase } = useWorld();
  if (phase === "loading") return <LoadingScreen />;
  if (phase === "intro") return <IntroScreen />;
  return <RoomScene />;
}

export function WithYouApp() {
  return (
    <WorldProvider>
      <Shell />
    </WorldProvider>
  );
}
