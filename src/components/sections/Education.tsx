"use client";

import { GraduationCap } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef, useState } from "react";
import type { SectionItem } from "@/lib/types";
import { CountUp } from "../fx/CountUp";
import { SectionFrame } from "./SectionFrame";
import type { SectionProps } from "./types";

const HEX = "polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0 50%)";
const yearOf = (d: string | null) => (d ? new Date(d).getUTCFullYear() : new Date().getUTCFullYear());
const pad = (n: number) => String(n).padStart(2, "0");
const COLORS = ["var(--chart-2)", "var(--primary)", "var(--chart-3)"];

interface Level {
  item: SectionItem;
  level: number;
  from: number; // 0..1 along the track
  to: number;
  color: string;
  grade: number;
  gradeLabel: string;
}

/**
 * Education as a game progression track: levels sit on a year axis, an XP bar
 * fills as you scroll, and each level it reaches lights up and unlocks its
 * grade as a stat.
 */
export function Education({ section, index }: SectionProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Oldest first so the track reads left → right (top → bottom on mobile).
  const items = [...section.items].sort((a, b) => yearOf(a.startDate) - yearOf(b.startDate));
  const minYear = Math.min(...items.map((i) => yearOf(i.startDate)));
  const maxYear = Math.max(...items.map((i) => yearOf(i.endDate)));
  const span = Math.max(1, maxYear - minYear);
  const years = Array.from({ length: span + 1 }, (_, i) => minYear + i);
  const levels: Level[] = items.map((item, i) => {
    const data = item.data as { grade?: string; gradeLabel?: string };
    return {
      item,
      level: i + 1,
      from: (yearOf(item.startDate) - minYear) / span,
      to: (yearOf(item.endDate) - minYear) / span,
      color: COLORS[i % COLORS.length],
      grade: data.grade ? Number.parseFloat(data.grade) : NaN,
      gradeLabel: data.gradeLabel ?? "grade",
    };
  });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 45%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 22 });
  const [progress, setProgress] = useState(reduce ? 1 : 0);
  useMotionValueEvent(fill, "change", (v) => !reduce && setProgress(v));
  const reached = (l: Level) => progress >= l.from + 0.02;
  const cleared = levels.filter((l) => progress >= l.to - 0.02).length;

  return (
    <SectionFrame
      section={section}
      index={index}
      decor={
        <>
          <div className="bg-grid absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_70%)]" />
          <div className="absolute top-1/3 left-1/5 h-72 w-72 rounded-full bg-chart-2/10 blur-[110px]" />
          <div className="absolute right-1/5 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-[110px]" />
        </>
      }
    >
      <p className="-mt-6 mb-12 font-mono text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
        progression <span className="text-highlight">{"//"}</span>{" "}
        <span className="font-bold text-foreground">
          {cleared}/{levels.length}
        </span>{" "}
        levels cleared
      </p>

      <div ref={ref}>
        {/* Desktop: horizontal track */}
        <div className="relative hidden h-[24rem] lg:block">
          {/* Level info above the track */}
          {levels.map((l) => (
            <motion.div
              key={l.item.id}
              className="absolute top-0 pr-8"
              style={{ left: `${l.from * 100}%`, width: `${(l.to - l.from) * 100}%` }}
              animate={{ opacity: reached(l) ? 1 : 0.35, y: reached(l) ? 0 : 8 }}
              transition={{ duration: 0.5 }}
            >
              <LevelInfo l={l} />
            </motion.div>
          ))}

          {/* Track */}
          <div className="absolute inset-x-0 top-[13.5rem]">
            <div className="relative h-2 rounded-full bg-border">
              {levels.map((l) => (
                <span
                  key={l.item.id}
                  className="absolute inset-y-0 rounded-full opacity-25"
                  style={{ left: `${l.from * 100}%`, width: `${(l.to - l.from) * 100}%`, background: l.color }}
                />
              ))}
              <motion.span
                className="absolute inset-y-0 left-0 w-full origin-left rounded-full"
                style={{
                  scaleX: reduce ? 1 : fill,
                  background: `linear-gradient(90deg, ${levels.map((l) => l.color).join(", ")})`,
                  boxShadow: "0 0 14px var(--primary)",
                }}
              />
              {/* Level nodes + graduation flags */}
              {levels.map((l) => (
                <span key={l.item.id}>
                  <Node l={l} on={reached(l)} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${l.from * 100}%` }} />
                  <span
                    className="absolute top-1/2 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-background transition-colors duration-500"
                    style={{ left: `${l.to * 100}%`, borderColor: progress >= l.to - 0.02 ? l.color : "var(--border)" }}
                  >
                    <GraduationCap className="h-3.5 w-3.5" style={{ color: progress >= l.to - 0.02 ? l.color : "var(--muted-foreground)" }} aria-hidden />
                  </span>
                </span>
              ))}
            </div>

            {/* Year ticks */}
            <div className="relative mt-4 h-4">
              {years.map((y) => (
                <span
                  key={y}
                  className="absolute -translate-x-1/2 font-mono text-[10px] text-muted-foreground"
                  style={{ left: `${((y - minYear) / span) * 100}%` }}
                >
                  {y}
                </span>
              ))}
            </div>
          </div>

          {/* Stat unlocks below the track */}
          {levels.map((l) => (
            <div key={l.item.id} className="absolute top-[17.5rem]" style={{ left: `${l.from * 100}%` }}>
              <Unlock l={l} on={reached(l)} />
            </div>
          ))}
        </div>

        {/* Mobile: vertical track */}
        <ol className="relative space-y-12 pl-14 lg:hidden">
          <span className="absolute top-2 bottom-2 left-[19px] w-1 rounded-full bg-border" />
          <motion.span
            className="absolute top-2 bottom-2 left-[19px] w-1 origin-top rounded-full"
            style={{ scaleY: reduce ? 1 : fill, background: `linear-gradient(to bottom, ${levels.map((l) => l.color).join(", ")})`, boxShadow: "0 0 12px var(--primary)" }}
          />
          {levels.map((l) => (
            <li key={l.item.id} className="relative">
              <Node l={l} on={reached(l)} className="absolute top-0 -left-14" />
              <LevelInfo l={l} />
              <div className="mt-4">
                <Unlock l={l} on={reached(l)} />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionFrame>
  );
}

function LevelInfo({ l }: { l: Level }) {
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.25em] uppercase" style={{ color: l.color }}>
        lv.{pad(l.level)} <span className="text-muted-foreground">· {yearOf(l.item.startDate)} → {yearOf(l.item.endDate)}</span>
      </p>
      <h3 className="mt-2 text-2xl leading-tight font-black tracking-tight">{l.item.title}</h3>
      <p className="mt-1 font-semibold text-highlight">{l.item.subtitle}</p>
      {l.item.description && (
        <p className="mt-2 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          {"// "}
          {l.item.description.replace(/\.$/, "")}
        </p>
      )}
    </div>
  );
}

function Node({ l, on, className, style }: { l: Level; on: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={className} style={style}>
      <span className="relative grid h-10 w-11 place-items-center p-[2px] transition-colors duration-500" style={{ clipPath: HEX, background: on ? l.color : "var(--border)" }}>
        <span className="grid h-full w-full place-items-center bg-background font-mono text-[10px] font-black" style={{ clipPath: HEX, color: on ? l.color : "var(--muted-foreground)" }}>
          {pad(l.level)}
        </span>
      </span>
      {on && (
        <motion.span
          aria-hidden
          className="absolute inset-0 h-10 w-11"
          style={{ clipPath: HEX, background: l.color }}
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 1.9 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
        />
      )}
    </span>
  );
}

function Unlock({ l, on }: { l: Level; on: boolean }) {
  if (Number.isNaN(l.grade)) return null;
  return (
    <AnimatePresence>
      {on ? (
        <motion.div
          key="on"
          initial={{ opacity: 0, y: -10, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="inline-flex items-center gap-3 rounded-lg border bg-card/80 px-4 py-2.5 backdrop-blur"
          style={{ borderColor: l.color, boxShadow: `0 0 24px -8px ${l.color}` }}
        >
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: l.color }}>
            ◆ {l.gradeLabel}
          </span>
          <span className="text-2xl font-black tracking-tighter text-foreground">
            <CountUp value={l.grade} decimals={2} />
          </span>
          <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">unlocked</span>
        </motion.div>
      ) : (
        <motion.div
          key="off"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed px-4 py-2.5 font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase"
        >
          🔒 {l.gradeLabel} locked
        </motion.div>
      )}
    </AnimatePresence>
  );
}
