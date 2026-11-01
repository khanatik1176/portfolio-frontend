"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";

const DASH = 1800;

/**
 * A signature that writes itself like ink: the pen traces the outline, the ink
 * fills in, a balanced flourish sweeps underneath and a sparkle dots the end.
 */
export function Signature({ text, className = "" }: { text: string; className?: string }) {
  const id = useId();
  const reduce = useReducedMotion();
  const view = { once: true, margin: "-40px" } as const;
  return (
    <svg viewBox="0 0 600 260" className={`h-auto w-full overflow-visible ${className}`} role="img" aria-label={`Signature: ${text}`}>
      <defs>
        <linearGradient id={`${id}ink`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--chart-2)" />
          <stop offset="0.5" stopColor="oklch(0.72 0.2 330)" />
          <stop offset="1" stopColor="var(--primary)" />
        </linearGradient>
      </defs>

      <motion.text
        x="300"
        y="150"
        textAnchor="middle"
        fontSize="190"
        style={{ fontFamily: "var(--font-signature-face), cursive" }}
        stroke={`url(#${id}ink)`}
        strokeWidth="1.6"
        fill={`url(#${id}ink)`}
        strokeDasharray={DASH}
        initial={reduce ? false : { strokeDashoffset: DASH, fillOpacity: 0 }}
        whileInView={{ strokeDashoffset: 0, fillOpacity: 1 }}
        viewport={view}
        transition={{ strokeDashoffset: { duration: 2.6, ease: [0.45, 0, 0.25, 1] }, fillOpacity: { duration: 1.1, delay: 1.7 } }}
      >
        {text}
      </motion.text>

      {/* Flourish: rises gently under the first letters, dips through the middle and lifts out past the end. */}
      <motion.path
        d="M118 196 C 190 222, 300 226, 392 206 S 500 172, 534 160"
        fill="none"
        stroke={`url(#${id}ink)`}
        strokeWidth="3.2"
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={view}
        transition={{ duration: 1.1, delay: 2.3, ease: "easeOut" }}
      />
      <motion.path
        d="M548 136 Q548 152 564 152 Q548 152 548 168 Q548 152 532 152 Q548 152 548 136 Z"
        fill="var(--primary)"
        style={{ transformOrigin: "548px 152px", transformBox: "view-box" }}
        initial={reduce ? false : { scale: 0, rotate: -90 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={view}
        transition={{ type: "spring", stiffness: 260, damping: 12, delay: 3.2 }}
      />
    </svg>
  );
}
