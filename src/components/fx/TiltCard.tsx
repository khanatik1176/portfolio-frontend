"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

/** Card that tilts toward the cursor in 3D with a soft green spotlight following it. */
export function TiltCard({ children, className = "", max = 7, style }: { children: ReactNode; className?: string; max?: number; style?: CSSProperties }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(mx, [0, 1], [-max, max]), { stiffness: 180, damping: 18 });
  const rotateX = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 180, damping: 18 });

  return (
    <motion.div
      className={`group relative ${className}`}
      style={{ rotateX, rotateY, transformPerspective: 1000, ...style }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
        e.currentTarget.style.setProperty("--sx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--sy", `${e.clientY - r.top}px`);
      }}
      onPointerLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
    >
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--sx, 50%) var(--sy, 50%), color-mix(in oklch, var(--primary) 13%, transparent), transparent 60%)" }}
      />
    </motion.div>
  );
}
