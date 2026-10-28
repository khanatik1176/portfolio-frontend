"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Endless horizontal ticker. Content is rendered twice so the loop is seamless. */
export function Marquee({ children, reverse = false, duration = 40 }: { children: ReactNode; reverse?: boolean; duration?: number }) {
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <motion.div
        className="flex shrink-0 gap-4 pr-4"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
