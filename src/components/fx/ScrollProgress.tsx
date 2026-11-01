"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Thin purple-to-green bar along the top edge that fills with page progress. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-[linear-gradient(90deg,var(--secondary),var(--primary))]"
      style={{ scaleX }}
    />
  );
}
