"use client";

import { motion } from "motion/react";

/**
 * A mini Joker playing card showing an index ("01"). It flips from its
 * patterned back to the face when scrolled into view and wobbles on hover.
 */
export function CardIndex({ value, size = "md", className = "" }: { value: string; size?: "sm" | "md"; className?: string }) {
  const dims = size === "sm" ? "h-16 w-12 rounded-lg" : "h-24 w-[4.25rem] rounded-xl";
  return (
    <motion.div
      aria-hidden
      className={`relative shrink-0 [perspective:600px] ${dims} ${className}`}
      whileHover={{ rotate: [0, -8, 6, -3, 0], transition: { duration: 0.6 } }}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        initial={{ rotateY: 180 }}
        whileInView={{ rotateY: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Face */}
        <div
          className={`absolute inset-0 flex flex-col justify-between border-2 border-primary/60 bg-[linear-gradient(160deg,oklch(0.27_0.1_305),oklch(0.17_0.05_300))] p-1.5 shadow-[0_10px_30px_-10px_var(--secondary)] [backface-visibility:hidden] ${dims}`}
        >
          <span className="font-display text-[10px] leading-none font-extrabold text-primary">✦</span>
          <span className={`text-center font-sans leading-none font-bold tracking-tight text-primary tabular-nums ${size === "sm" ? "text-lg" : "text-[1.7rem]"}`}>{value}</span>
          <span className="rotate-180 font-display text-[10px] leading-none font-extrabold text-primary">✦</span>
        </div>
        {/* Back */}
        <div
          className={`absolute inset-0 border-2 border-white/15 [backface-visibility:hidden] [transform:rotateY(180deg)] ${dims}`}
          style={{ background: "repeating-linear-gradient(45deg, var(--secondary) 0 6px, color-mix(in oklch, var(--secondary) 55%, black) 6px 12px)" }}
        />
      </motion.div>
    </motion.div>
  );
}
