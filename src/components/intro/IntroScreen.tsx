"use client";

import { motion } from "framer-motion";
import { useWorld } from "@/context/WorldContext";

export function IntroScreen() {
  const { enterRoom, brand } = useWorld();

  return (
    <div className="intro">
      <div className="intro-grain" />
      <motion.div
        className="intro-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        <p className="intro-mark">88.0</p>
        <h1 className="intro-logo">{brand.brand}</h1>
        <p className="intro-slogan">{brand.slogan}</p>
        <p className="intro-en">{brand.sloganEn}</p>
        <button type="button" className="intro-dinle" onClick={enterRoom}>
          <span>{brand.listen}</span>
        </button>
        <p className="intro-hint">turn the dial. stay a while.</p>
      </motion.div>
    </div>
  );
}
