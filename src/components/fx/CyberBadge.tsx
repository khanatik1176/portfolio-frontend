"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";

const HEX = "100,70 126,85 126,115 100,130 74,115 74,85";

/**
 * Cyberpunk HUD dial: rotating ring text with an RGB-split ghost, a
 * counter-rotating tick ring, a segmented arc with an orbiting diamond, and a
 * glowing hex core. The whole badge glitches briefly every few seconds.
 */
export function CyberBadge({ text, core = "KAF", size = 190 }: { text: string; core?: string; size?: number }) {
  const reduce = useReducedMotion();
  const id = useId();
  const spin = (duration: number, dir = 1) =>
    reduce ? {} : { animate: { rotate: 360 * dir }, transition: { duration, repeat: Infinity, ease: "linear" as const } };

  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      animate={reduce ? undefined : { x: [0, 0, -3, 2, 0], opacity: [1, 1, 0.55, 1, 1] }}
      transition={{ duration: 5, repeat: Infinity, times: [0, 0.9, 0.92, 0.95, 1] }}
    >
      {/* Tick ring */}
      <motion.svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" {...spin(40, -1)}>
        {Array.from({ length: 60 }, (_, i) => (
          <line
            key={i}
            x1="100"
            y1="3"
            x2="100"
            y2={i % 5 === 0 ? 11 : 7}
            stroke={i % 5 === 0 ? "var(--chart-2)" : "var(--muted-foreground)"}
            strokeOpacity={i % 5 === 0 ? 0.9 : 0.35}
            strokeWidth={i % 5 === 0 ? 1.5 : 0.8}
            transform={`rotate(${i * 6} 100 100)`}
          />
        ))}
      </motion.svg>

      {/* Ring text with RGB-split ghosts */}
      <motion.svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full overflow-visible" {...spin(22)}>
        <defs>
          <path id={id} d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
        </defs>
        {[
          { fill: "var(--chart-3)", dx: 1.5, opacity: 0.55 },
          { fill: "var(--chart-2)", dx: -1.5, opacity: 0.55 },
          { fill: "var(--primary)", dx: 0, opacity: 1 },
        ].map((layer) => (
          <text
            key={layer.fill}
            transform={`translate(${layer.dx} 0)`}
            fill={layer.fill}
            opacity={layer.opacity}
            className="font-mono text-[13px] font-bold uppercase"
            style={{ letterSpacing: "0.32em", filter: layer.dx === 0 ? "drop-shadow(0 0 4px var(--primary))" : undefined }}
          >
            <textPath href={`#${id}`}>{text}</textPath>
          </text>
        ))}
      </motion.svg>

      {/* Segmented arc + orbiting diamond */}
      <motion.svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" {...spin(10, -1)}>
        <circle
          cx="100"
          cy="100"
          r="56"
          fill="none"
          stroke="var(--chart-3)"
          strokeWidth="2"
          strokeDasharray="70 18 12 18 40 18"
          strokeLinecap="square"
          style={{ filter: "drop-shadow(0 0 4px var(--chart-3))" }}
        />
        <rect x="153" y="97" width="6" height="6" fill="var(--primary)" transform="rotate(45 156 100)" />
      </motion.svg>

      {/* Hex core */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
        <polygon points={HEX} fill="var(--background)" stroke="var(--primary)" strokeWidth="1.5" style={{ filter: "drop-shadow(0 0 6px var(--primary))" }} />
        <polygon points={HEX} fill="none" stroke="var(--chart-2)" strokeOpacity="0.5" strokeWidth="1" transform="translate(100 100) scale(0.78) translate(-100 -100)" />
        <motion.circle
          cx="100"
          cy="94"
          r="5"
          fill="var(--primary)"
          animate={reduce ? undefined : { opacity: [1, 0.3, 1], r: [5, 6.5, 5] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          style={{ filter: "drop-shadow(0 0 6px var(--primary))" }}
        />
        <text x="100" y="114" textAnchor="middle" fill="var(--foreground)" className="font-mono text-[9px] font-bold" style={{ letterSpacing: "0.25em" }}>
          {core}
        </text>
      </svg>
    </motion.div>
  );
}
