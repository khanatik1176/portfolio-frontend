"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { clsx } from "clsx";
import type { ReactNode } from "react";

/** 3D tilt toward the cursor with a lime spotlight that tracks it. */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [7, -7]), { stiffness: 150, damping: 18 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-7, 7]), { stiffness: 150, damping: 18 });
  const lx = useTransform(px, (v) => `${v * 100}%`);
  const ly = useTransform(py, (v) => `${v * 100}%`);
  const spotlight = useMotionTemplate`radial-gradient(400px circle at ${lx} ${ly}, color-mix(in oklch, var(--primary) 16%, transparent), transparent 65%)`;

  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
      className={clsx(
        "group relative overflow-hidden rounded-lg border bg-card/70 shadow-lg backdrop-blur transition-colors hover:border-primary/60",
        className,
      )}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}
