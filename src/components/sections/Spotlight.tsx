"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { SectionItem } from "@/lib/types";
import { SectionFrame } from "./SectionFrame";
import type { SectionProps } from "./types";

const EASE = [0.22, 1, 0.36, 1] as const;
const LEAVES = 9;

/** One side of the laurel: a curved stem that draws itself, then leaves that grow in from the base up. */
function Branch({ flip }: { flip?: boolean }) {
  const leaves = Array.from({ length: LEAVES }, (_, i) => {
    // Points along an arc from the bottom center up the left side of a 200x200 box.
    const t = 0.12 + (i / (LEAVES - 1)) * 0.78;
    const a = Math.PI / 2 + t * Math.PI * 0.95;
    const x = 100 + Math.cos(a) * 82;
    const y = 100 + Math.sin(a) * 82;
    const deg = (a * 180) / Math.PI + 90 + 35;
    return { x, y, deg, i };
  });
  return (
    <g transform={flip ? "translate(200 0) scale(-1 1)" : undefined}>
      <motion.path
        d="M100 186 A 86 86 0 0 1 62 23"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: EASE }}
      />
      {leaves.map(({ x, y, deg, i }) => (
        // Rotation lives on the group: the animated scale would override a transform on the ellipse itself.
        <g key={i} transform={`rotate(${deg} ${x} ${y})`}>
          <motion.ellipse
            cx={x}
            cy={y}
            rx="6"
            ry="13"
            fill={i % 2 ? "var(--primary)" : "oklch(0.75 0.2 140)"}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.3 + i * 0.08 }}
          />
        </g>
      ))}
    </g>
  );
}

/** Honours emblem: a laurel wreath that draws itself around the badge figure. */
function Laurel({ badge }: { badge?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto h-56 w-56 shrink-0 sm:h-64 sm:w-64">
      <span aria-hidden className="absolute inset-8 rounded-full bg-secondary/40 blur-3xl" />
      <motion.span
        aria-hidden
        className="absolute inset-10 rounded-full border border-dashed border-primary/30"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <Branch />
        <Branch flip />
      </svg>
      <motion.div
        className="absolute inset-0 grid place-items-center text-center"
        initial={{ opacity: 0, scale: 0.7 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
      >
        <div>
          <p className="text-joker font-sans text-6xl leading-none font-bold tracking-tight sm:text-7xl">{badge ?? "✦"}</p>
          <p className="mt-2 font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Honours</p>
        </div>
      </motion.div>
    </div>
  );
}

/** Segmented track with one segment per time awarded, filling in sequence. */
function AwardTrack({ times }: { times: number }) {
  return (
    <div className="mt-8">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="text-muted-foreground">Times awarded</span>
        <span className="font-semibold tabular-nums">
          {times} <span className="font-normal text-muted-foreground">of {times}</span>
        </span>
      </div>
      <ol className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${times}, minmax(0, 1fr))` }} aria-label={`Awarded ${times} times`}>
        {Array.from({ length: times }, (_, i) => (
          <li key={i}>
            <div className="h-2.5 overflow-hidden rounded-full bg-border">
              <motion.div
                className="h-full origin-left rounded-full bg-[linear-gradient(90deg,var(--chart-2),var(--primary))]"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1 + i * 0.25, ease: EASE }}
              />
            </div>
            <p className="mt-2 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">Award {String(i + 1).padStart(2, "0")}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function AwardCard({ item }: { item: SectionItem }) {
  const badge = (item.data as { badge?: string }).badge;
  const times = badge ? Number.parseInt(badge, 10) : NaN;
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: EASE }}
      className="relative overflow-hidden rounded-[2rem] border bg-[radial-gradient(ellipse_at_18%_50%,oklch(0.24_0.09_305),var(--card)_60%)] p-6 sm:p-10 lg:p-14"
    >
      <div className="relative grid items-center gap-10 md:grid-cols-[auto_1fr] md:gap-14">
        <Laurel badge={badge} />
        <div>
          {item.subtitle && <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">{item.subtitle}</p>}
          <h3 className="mt-3 font-display text-3xl leading-[1.05] font-bold tracking-tight sm:text-5xl">{item.title}</h3>
          {item.description && <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">{item.description}</p>}
          {Number.isFinite(times) && times > 0 && times <= 12 && <AwardTrack times={times} />}
          {item.link && (
            <a href={item.link} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Learn more <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/** Awards and other CUSTOM sections: a self-drawing laurel emblem beside the details and a segmented award track. */
export function Spotlight({ section, index }: SectionProps) {
  const body = section.content.body as string | undefined;
  return (
    <SectionFrame section={section} index={index}>
      {body && <p className="mb-8 max-w-2xl whitespace-pre-line text-muted-foreground">{body}</p>}
      <div className="grid gap-6">
        {section.items.map((item) => (
          <AwardCard key={item.id} item={item} />
        ))}
      </div>
    </SectionFrame>
  );
}
