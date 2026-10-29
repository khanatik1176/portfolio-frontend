"use client";

import { motion, useReducedMotion } from "motion/react";

// SVG canvas (viewBox units). Roles are HTML labels positioned over it.
const W = 400;
const H = 100;
const CHIP = { x: 10, y: 30, w: 56, h: 40 };
const NODE_X = 122; // where traces end and labels begin
const BUS_X = 96; // vertical bus where traces turn

/**
 * Circuit-board role picker: a "KAF" processor chip routes a glowing data
 * packet along right-angled traces to `words[index]`; that trace lights up and
 * the role comes online with a "linked" tag and pulse.
 */
export function CircuitRoles({ words, index }: { words: string[]; index: number }) {
  const reduce = useReducedMotion();
  const n = words.length;
  const rowY = (i: number) => 12 + (i * (H - 24)) / Math.max(1, n - 1);
  const pinY = (i: number) => CHIP.y + 7 + (i * (CHIP.h - 14)) / Math.max(1, n - 1);
  const trace = (i: number) => `M ${CHIP.x + CHIP.w} ${pinY(i).toFixed(1)} H ${BUS_X - i * 6} V ${rowY(i).toFixed(1)} H ${NODE_X}`;

  return (
    <div className="relative w-full max-w-md" style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        {/* Traces */}
        {words.map((word, i) => {
          const live = i === index;
          return (
            <g key={word}>
              <path d={trace(i)} fill="none" stroke="var(--border)" strokeWidth="1.5" />
              {live && (
                <motion.path
                  d={trace(i)}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  style={{ filter: "drop-shadow(0 0 4px var(--primary))" }}
                  initial={{ pathLength: reduce ? 1 : 0, strokeDashoffset: 0 }}
                  animate={{ pathLength: 1, strokeDashoffset: -48 }}
                  transition={{ pathLength: { duration: 0.6, ease: "easeOut" }, strokeDashoffset: { duration: 1.6, repeat: Infinity, ease: "linear" } }}
                />
              )}
              {/* Via at the end of each trace */}
              <circle cx={NODE_X} cy={rowY(i)} r="2.5" fill={live ? "var(--primary)" : "var(--border)"} />
            </g>
          );
        })}

        {/* Data packet travelling the live trace (re-mounted per index to restart) */}
        {!reduce && n > 0 && (
          <circle key={`packet-${index}`} r="3" fill="var(--chart-2)" style={{ filter: "drop-shadow(0 0 6px var(--chart-2))" }}>
            <animateMotion dur="0.6s" fill="freeze" path={trace(index)} />
          </circle>
        )}

        {/* Processor chip */}
        <motion.rect
          x={CHIP.x - 4}
          y={CHIP.y - 4}
          width={CHIP.w + 8}
          height={CHIP.h + 8}
          rx="6"
          fill="var(--primary)"
          opacity="0.12"
          animate={reduce ? undefined : { opacity: [0.08, 0.22, 0.08] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
        {Array.from({ length: 4 }, (_, i) => {
          const x = CHIP.x + 9 + i * ((CHIP.w - 18) / 3);
          return (
            <g key={i} stroke="var(--muted-foreground)" strokeWidth="1.5" opacity="0.6">
              <line x1={x} y1={CHIP.y - 4} x2={x} y2={CHIP.y} />
              <line x1={x} y1={CHIP.y + CHIP.h} x2={x} y2={CHIP.y + CHIP.h + 4} />
            </g>
          );
        })}
        <rect x={CHIP.x} y={CHIP.y} width={CHIP.w} height={CHIP.h} rx="5" fill="var(--background)" stroke="var(--primary)" strokeWidth="1.5" />
        <rect x={CHIP.x + 4} y={CHIP.y + 4} width={CHIP.w - 8} height={CHIP.h - 8} rx="2" fill="none" stroke="var(--border)" strokeDasharray="2 3" />
        <text x={CHIP.x + CHIP.w / 2} y={CHIP.y + CHIP.h / 2 + 1} textAnchor="middle" className="fill-foreground font-mono text-[11px] font-bold" style={{ letterSpacing: "0.15em" }}>
          KAF
        </text>
        <text x={CHIP.x + CHIP.w / 2} y={CHIP.y + CHIP.h / 2 + 11} textAnchor="middle" className="fill-muted-foreground font-mono text-[5px]" style={{ letterSpacing: "0.3em" }}>
          CORE.01
        </text>
        <motion.circle
          cx={CHIP.x + CHIP.w - 7}
          cy={CHIP.y + 7}
          r="2"
          fill="var(--primary)"
          animate={reduce ? undefined : { opacity: [1, 0.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </svg>

      {/* Role labels */}
      {words.map((word, i) => {
        const live = i === index;
        return (
          <div
            key={word}
            className="absolute flex -translate-y-1/2 items-center gap-2"
            style={{ left: `${((NODE_X + 6) / W) * 100}%`, top: `${((rowY(i) / H) * 100).toFixed(3)}%` }}
          >
            <span
              className={`relative border px-1.5 py-0.5 font-mono text-[10px] tracking-wider whitespace-nowrap uppercase transition-all duration-500 sm:text-[11px] ${
                live ? "border-primary bg-primary/10 font-bold text-highlight" : "border-transparent text-muted-foreground opacity-60"
              }`}
              style={live ? { textShadow: "0 0 12px color-mix(in oklch, var(--primary) 60%, transparent)" } : undefined}
            >
              {live && !reduce && (
                <motion.span
                  key={`ping-${index}`}
                  aria-hidden
                  className="absolute inset-0 border border-primary"
                  initial={{ opacity: 0.8, scale: 1 }}
                  animate={{ opacity: 0, scale: 1.25 }}
                  transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                />
              )}
              {word}
            </span>
            {live && (
              <motion.span
                key={`tag-${index}`}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduce ? 0 : 0.6 }}
                className="hidden font-mono text-[9px] font-bold tracking-widest text-chart-2 uppercase sm:inline"
              >
                ◉ linked
              </motion.span>
            )}
          </div>
        );
      })}
    </div>
  );
}
