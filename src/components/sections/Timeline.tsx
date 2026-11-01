"use client";

import { MapPin } from "lucide-react";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import type { SectionItem } from "@/lib/types";
import { useNow } from "../fx/useNow";
import { SectionFrame } from "./SectionFrame";
import { duration, fmtMonth, monogram, type SectionProps } from "./types";

interface ExperienceData {
  logoUrl?: string;
  location?: string;
  highlights?: string[];
}

const TONES = ["var(--primary)", "var(--chart-2)", "var(--chart-4)", "var(--chart-3)"];
const EASE = [0.22, 1, 0.36, 1] as const;

const month = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
const year = (d: string) => new Date(d).getUTCFullYear();

/** The burning tip of the fuse: a glowing ember throwing off sparks. */
function Spark() {
  const reduce = useReducedMotion();
  return (
    <span className="relative grid h-6 w-6 place-items-center">
      <span className="absolute inset-0 rounded-full bg-primary/40 blur-md" />
      {!reduce &&
        [0, 1, 2, 3, 4].map((i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <motion.span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-chart-5"
              animate={{ x: [0, Math.cos(a) * 18], y: [0, Math.sin(a) * 18], opacity: [1, 0], scale: [1, 0.3] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.14, ease: "easeOut" }}
            />
          );
        })}
      <span className="relative h-3 w-3 rounded-full bg-primary shadow-[0_0_12px_4px_var(--primary)]" />
    </span>
  );
}

/** Company logo on the fuse; lights up once the burning tip reaches it. */
function Node({ item, tone }: { item: SectionItem; tone: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const lit = useInView(ref, { once: true, margin: "0px 0px -35% 0px" });
  const logo = (item.data as ExperienceData).logoUrl;
  const name = item.subtitle ?? item.title;
  return (
    <span ref={ref} className="relative z-10 grid h-10 w-10 place-items-center md:h-16 md:w-16">
      {lit && (
        <motion.span
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: tone }}
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 1.9, opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      )}
      <motion.span
        className="grid h-full w-full place-items-center overflow-hidden rounded-full border-2 bg-white"
        animate={{
          borderColor: lit ? tone : "var(--border)",
          boxShadow: lit ? `0 0 28px -4px ${tone}` : "0 0 0 0 transparent",
          scale: lit ? 1 : 0.85,
          filter: lit ? "grayscale(0)" : "grayscale(1)",
        }}
        transition={{ duration: 0.5 }}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={`${name} logo`} className="h-full w-full object-contain p-1.5 md:p-2" />
        ) : (
          <span className="text-[10px] font-bold text-neutral-700">{monogram(name)}</span>
        )}
      </motion.span>
    </span>
  );
}

/** Start date in oversized gradient type, shown opposite the card on wide screens. */
function DateMark({ item, clock, align }: { item: SectionItem; clock: number | null; align: "left" | "right" }) {
  const d = item.data as ExperienceData;
  if (!item.startDate) return <div />;
  return (
    <motion.div
      className={`hidden md:block ${align === "right" ? "text-left" : "text-right"}`}
      initial={{ opacity: 0, x: align === "right" ? 40 : -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
    >
      <p className="font-mono text-sm tracking-[0.3em] text-muted-foreground uppercase">{month(item.startDate)}</p>
      <p className="text-joker font-display text-7xl leading-none font-extrabold tracking-tight lg:text-8xl">{year(item.startDate)}</p>
      <p className="mt-3 font-mono text-xs text-muted-foreground">
        {(item.endDate || clock) && duration(item.startDate, item.endDate, clock ?? 0)}
        {d.location && ` · ${d.location}`}
      </p>
    </motion.div>
  );
}

function RoleCard({ item, tone, side, clock }: { item: SectionItem; tone: string; side: "left" | "right"; clock: number | null }) {
  const d = item.data as ExperienceData;
  const current = !item.endDate;
  return (
    <motion.article
      initial={{ opacity: 0, x: side === "left" ? -60 : 60, rotate: side === "left" ? -3 : 3 }}
      whileInView={{ opacity: 1, x: 0, rotate: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: EASE }}
      whileHover={{ y: -6 }}
      className="group relative overflow-hidden rounded-3xl border bg-card p-5 transition-[border-color,box-shadow] duration-300 hover:border-[var(--tone)] hover:shadow-[0_20px_60px_-20px_var(--tone)] sm:p-7"
      style={{ ["--tone" as string]: tone }}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${tone}, transparent)` }} />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-45"
        style={{ background: tone }}
      />

      <div className="relative flex flex-wrap items-center gap-2 font-mono text-[11px]">
        {item.startDate && (
          <span className="rounded-full border px-2.5 py-1 text-muted-foreground">
            {fmtMonth(item.startDate)} – {item.endDate ? fmtMonth(item.endDate) : "Present"}
          </span>
        )}
        {current && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 font-sans font-semibold text-primary-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground motion-reduce:animate-none" /> Now
          </span>
        )}
        {item.startDate && (item.endDate || clock) && (
          <span className="text-muted-foreground md:hidden">{duration(item.startDate, item.endDate, clock ?? 0)}</span>
        )}
      </div>

      <h3 className="relative mt-4 font-display text-2xl leading-tight font-bold tracking-tight sm:text-3xl">{item.title}</h3>
      <p className="relative mt-1 flex flex-wrap items-center gap-x-2 text-sm">
        <span className="font-semibold" style={{ color: tone }}>
          @ {item.subtitle}
        </span>
        {d.location && (
          <span className="inline-flex items-center gap-1 text-muted-foreground md:hidden">
            <MapPin className="h-3 w-3" aria-hidden /> {d.location}
          </span>
        )}
      </p>

      {item.description && <p className="relative mt-4 leading-relaxed text-muted-foreground">{item.description}</p>}

      {d.highlights && d.highlights.length > 0 && (
        <ul className="relative mt-5 grid gap-2.5">
          {d.highlights.map((h, i) => (
            <motion.li
              key={h}
              className="flex gap-3 text-sm leading-relaxed"
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
            >
              <span className="mt-0.5 text-xs" style={{ color: tone }}>
                ✦
              </span>
              {h}
            </motion.li>
          ))}
        </ul>
      )}

      {item.tags.length > 0 && (
        <ul className="relative mt-6 flex flex-wrap gap-1.5">
          {item.tags.map((t) => (
            <li key={t} className="rounded-full border bg-background/60 px-2.5 py-0.5 text-xs text-muted-foreground">
              {t}
            </li>
          ))}
        </ul>
      )}
    </motion.article>
  );
}

/**
 * Experience as a burning fuse: a purple-to-green line fills as you scroll
 * with a sparking ember at its tip; company logos light up as it reaches them,
 * and role cards swing in from alternating sides opposite their start date.
 */
export function Timeline({ section, index }: SectionProps) {
  const items = section.items;
  const clock = useNow();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start 65%", "end 65%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  const tip = useTransform(fill, (v) => `${v * 100}%`);

  const dated = items.filter((i) => i.startDate);
  const first = dated.length ? Math.min(...dated.map((i) => new Date(i.startDate!).getTime())) : null;
  const current = items.find((i) => !i.endDate);

  return (
    <SectionFrame section={section} index={index}>
      {/* Summary strip */}
      <motion.div
        className="mb-16 flex flex-wrap gap-3"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {first !== null && clock && (
          <span className="rounded-2xl border bg-card px-5 py-3">
            <span className="text-joker block font-display text-2xl font-extrabold">{duration(first, null, clock)}</span>
            <span className="text-xs text-muted-foreground">of professional experience</span>
          </span>
        )}
        <span className="rounded-2xl border bg-card px-5 py-3">
          <span className="text-joker block font-display text-2xl font-extrabold">{items.length} teams</span>
          <span className="text-xs text-muted-foreground">I&apos;ve shipped with</span>
        </span>
        {current && (
          <span className="rounded-2xl border border-primary/40 bg-primary/10 px-5 py-3">
            <span className="block font-display text-2xl font-extrabold text-primary">{current.subtitle}</span>
            <span className="text-xs text-muted-foreground">where I am now</span>
          </span>
        )}
      </motion.div>

      <div ref={trackRef} className="relative">
        {/* Fuse: unlit track, burnt fill and the sparking tip */}
        <div aria-hidden className="absolute top-0 bottom-0 left-5 w-1 -translate-x-1/2 rounded-full bg-border/70 md:left-1/2" />
        <motion.div
          aria-hidden
          style={{ scaleY: fill }}
          className="absolute top-0 bottom-0 left-5 w-1 origin-top -translate-x-1/2 rounded-full bg-[linear-gradient(to_bottom,var(--secondary),var(--primary))] shadow-[0_0_16px_var(--primary)] md:left-1/2"
        />
        <motion.div aria-hidden style={{ top: tip }} className="absolute left-5 z-20 -translate-x-1/2 -translate-y-1/2 md:left-1/2">
          <Spark />
        </motion.div>

        <ol className="relative grid gap-14 md:gap-24">
          {items.map((item, i) => {
            const tone = TONES[i % TONES.length];
            const cardLeft = i % 2 === 0;
            return (
              <li key={item.id} id={item.id} className="grid scroll-mt-28 grid-cols-[2.5rem_minmax(0,1fr)] items-start gap-4 md:grid-cols-[minmax(0,1fr)_4rem_minmax(0,1fr)] md:items-center md:gap-10">
                {/* Wide screens alternate sides; small screens keep node then card. */}
                <div className="hidden md:block">
                  {cardLeft ? <RoleCard item={item} tone={tone} side="left" clock={clock} /> : <DateMark item={item} clock={clock} align="left" />}
                </div>
                <div className="flex justify-center pt-5 md:pt-0">
                  <Node item={item} tone={tone} />
                </div>
                <div className="hidden md:block">
                  {cardLeft ? <DateMark item={item} clock={clock} align="right" /> : <RoleCard item={item} tone={tone} side="right" clock={clock} />}
                </div>
                <div className="md:hidden">
                  <RoleCard item={item} tone={tone} side="right" clock={clock} />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </SectionFrame>
  );
}
