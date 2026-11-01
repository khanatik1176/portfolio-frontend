"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";

/**
 * The "wild card" mark: a tilted playing card with a purple-to-green edge, a
 * geometric K and a Joker sparkle on its arm. On hover the card wobbles and
 * the sparkle spins. Matches public/logo.svg and app/icon.svg.
 */
export function LogoMark({ className = "h-9 w-9", animated = true }: { className?: string; animated?: boolean }) {
  const id = useId();
  const reduce = useReducedMotion();
  const live = animated && !reduce;
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden
      initial="rest"
      whileHover={live ? "hover" : undefined}
      animate="rest"
    >
      <defs>
        <linearGradient id={`${id}e`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--chart-2)" />
          <stop offset="1" stopColor="var(--primary)" />
        </linearGradient>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="oklch(0.26 0.1 305)" />
          <stop offset="1" stopColor="oklch(0.17 0.05 300)" />
        </linearGradient>
      </defs>
      <motion.g
        style={{ transformOrigin: "32px 32px", transformBox: "view-box" }}
        variants={{ rest: { rotate: -8 }, hover: { rotate: [-8, 6, -14, -4, -8], transition: { duration: 0.7 } } }}
      >
        <rect x="11" y="5" width="42" height="54" rx="9" fill={`url(#${id}f)`} stroke={`url(#${id}e)`} strokeWidth="3" />
        <rect x="20" y="17" width="7" height="30" rx="2" fill="var(--foreground)" />
        <path d="M26 31 L37.5 17.5 L45.5 17.5 L31.5 33 Z" fill="var(--foreground)" />
        <path d="M30 30 L36.5 30 L46 47 L38.5 47 Z" fill="var(--chart-2)" />
        <motion.path
          d="M45 7 Q45 15 53 15 Q45 15 45 23 Q45 15 37 15 Q45 15 45 7 Z"
          fill="var(--primary)"
          style={{ transformOrigin: "45px 15px", transformBox: "view-box" }}
          variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: 180, scale: 1.25, transition: { duration: 0.6 } } }}
        />
        <path d="M18 48 Q18 52 22 52 Q18 52 18 56 Q18 52 14 52 Q18 52 18 48 Z" fill="var(--chart-2)" />
      </motion.g>
    </motion.svg>
  );
}
