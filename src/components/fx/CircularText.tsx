"use client";

import { motion } from "motion/react";
import { useId, type ReactNode } from "react";

/** Text set on a circle that slowly spins, with optional content in the middle. */
export function CircularText({
  text,
  size = 160,
  duration = 18,
  className,
  children,
}: {
  text: string;
  size?: number;
  duration?: number;
  className?: string;
  children?: ReactNode;
}) {
  const id = useId();
  return (
    <div className={`relative grid place-items-center ${className ?? ""}`} style={{ width: size, height: size }}>
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        animate={{ rotate: 360 }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <path id={id} d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-current font-mono text-[8.5px] font-bold tracking-[0.2em] uppercase">
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </motion.svg>
      {children}
    </div>
  );
}
