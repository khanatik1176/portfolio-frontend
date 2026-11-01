"use client";

import { ArrowDownRight, MapPin } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { JokerCard } from "../fx/JokerCard";
import { LiveClock } from "../fx/LiveClock";
import { Magnetic } from "../fx/Magnetic";
import type { SectionProps } from "./types";

interface HeroContent {
  badge?: string;
  availability?: string;
  timeZone?: string;
  rolePrefix?: string;
  roles?: string[];
  stack?: string[];
  /** Tech chips floating around the Joker card; falls back to part of `stack`. */
  cardChips?: string[];
  openTo?: string[];
  ctaHref?: string;
  ctaLabel?: string;
  secondaryCtaHref?: string;
  secondaryCtaLabel?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/** Cycles through phrases one at a time with a vertical slide. */
function RotatingRole({ items }: { items: string[] }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce || items.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % items.length), 2400);
    return () => clearInterval(id);
  }, [items.length, reduce]);
  return (
    <span className="relative inline-grid overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={items[i]}
          className="font-serif text-[1.2em] text-primary italic"
          initial={{ y: "100%", opacity: 0, filter: "blur(4px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-100%", opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {items[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Name whose letters spring up in sequence and hop when hovered; the last word is set in the accent green. */
function AnimatedName({ name }: { name: string }) {
  const words = name.split(" ");
  // Index of each word's first letter across the whole name, for the stagger.
  const starts = words.map((_, i) => words.slice(0, i).join("").length);
  return (
    <>
      <span className="sr-only">{name}</span>
      <span aria-hidden className="flex flex-wrap gap-x-[0.25em]">
        {words.map((word, wi) => (
          <span key={wi} className="inline-flex overflow-hidden pb-[0.08em]">
            {[...word].map((ch, ci) => (
              <motion.span
                key={ci}
                className={`inline-block ${wi === words.length - 1 ? "text-primary" : ""}`}
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, delay: 0.25 + (starts[wi] + ci) * 0.035, ease: EASE }}
                whileHover={{
                  y: "-12%",
                  color: wi === words.length - 1 ? "var(--chart-2)" : "var(--primary)",
                  transition: { type: "spring", stiffness: 500, damping: 12 },
                }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
        ))}
      </span>
    </>
  );
}

/** A full-bleed tilted tape scrolling its words endlessly. */
function Tape({ words, tone, reverse, className }: { words: string[]; tone: "green" | "purple"; reverse?: boolean; className: string }) {
  const items = [...words, ...words];
  return (
    <div
      className={`marquee absolute left-1/2 w-[120vw] -translate-x-1/2 overflow-hidden py-3 shadow-xl ${
        tone === "green" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
      } ${className}`}
    >
      <ul className={`flex w-max ${reverse ? "marquee-track-reverse" : "marquee-track"}`}>
        {items.map((w, i) => (
          <li key={i} aria-hidden={i >= words.length || undefined} className="flex items-center font-display text-lg font-bold whitespace-nowrap uppercase md:text-xl">
            <span className="px-5">{w}</span>
            <span className={tone === "green" ? "text-secondary" : "text-primary"}>✦</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Carnival "admit one" ticket: availability and the roles I'm open to on the
 * green side, a torn-off purple stub with location and live local time.
 * Swings in tilted and straightens on hover.
 */
function StatusTicket({ availability, openTo, location, timeZone }: { availability?: string; openTo: string[]; location: string | null; timeZone?: string }) {
  if (!availability && !location) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: -10 }}
      animate={{ opacity: 1, y: 0, rotate: -3 }}
      whileHover={{ rotate: 0, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 120, damping: 14, delay: 1.2 }}
      className="relative mx-auto flex w-full max-w-[27rem] drop-shadow-[0_18px_30px_oklch(0_0_0/0.45)]"
    >
      {availability && (
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-l-2xl bg-primary p-3.5 text-primary-foreground sm:p-4 sm:pr-5">
          <p className="font-mono text-[9px] tracking-[0.3em] uppercase opacity-70">Admit one · Status</p>
          <p className="mt-1.5 flex items-center gap-2 font-display text-base leading-tight font-bold sm:text-lg">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-70 motion-reduce:hidden" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary" />
            </span>
            {availability}
          </p>
          {openTo.length > 0 && <p className="mt-1.5 text-xs leading-snug opacity-80">{openTo.join(" · ")}</p>}
          <span
            aria-hidden
            className="mt-3 block h-5 w-28 opacity-60"
            style={{ background: "repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 4px, currentColor 4px 5px, transparent 5px 8px)" }}
          />
        </div>
      )}
      {/* Perforation with punched notches */}
      <div aria-hidden className="relative w-0 border-l-2 border-dashed border-primary-foreground/30">
        <span className="absolute -top-2 -left-2 h-4 w-4 rounded-full bg-background" />
        <span className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-background" />
      </div>
      {location && (
        <div className={`flex w-28 shrink-0 flex-col justify-between bg-secondary p-3.5 sm:w-36 sm:p-4 text-secondary-foreground ${availability ? "rounded-r-2xl" : "rounded-2xl"}`}>
          <p className="font-mono text-[9px] tracking-[0.3em] uppercase opacity-70">Based in</p>
          <p className="mt-1.5 flex items-start gap-1.5 text-sm leading-tight font-semibold">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            {location}
          </p>
          {timeZone && (
            <p className="mt-3 font-mono text-lg leading-none font-bold text-primary tabular-nums">
              <LiveClock timeZone={timeZone} />
            </p>
          )}
          {timeZone && <p className="mt-1 font-mono text-[9px] tracking-[0.2em] uppercase opacity-60">Local time</p>}
        </div>
      )}
    </motion.div>
  );
}

/** "Currently exploring" topics dealt like small tilted cards. */
function Exploring({ items }: { items: string[] }) {
  return (
    <div className="mt-12">
      <p className="mb-3 flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
        <span className="h-px w-6 bg-chart-2" />
        Currently exploring
      </p>
      <ul className="flex flex-wrap gap-2.5">
        {items.map((t, i) => (
          <motion.li
            key={t}
            initial={{ opacity: 0, y: 24, rotate: i % 2 ? 12 : -12 }}
            animate={{ opacity: 1, y: 0, rotate: i % 2 ? 2 : -2 }}
            whileHover={{ rotate: 0, y: -5, transition: { type: "spring", stiffness: 400, damping: 15 } }}
            transition={{ type: "spring", stiffness: 160, damping: 14, delay: 1.3 + i * 0.1 }}
            className="flex items-center gap-2 rounded-xl border border-chart-2/50 bg-[linear-gradient(160deg,oklch(0.26_0.1_305),oklch(0.19_0.05_300))] px-3.5 py-2 text-sm font-medium shadow-[0_8px_20px_-10px_var(--secondary)]"
          >
            <span className="text-xs text-primary">✦</span>
            {t}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Full-screen opening: drifting purple and green glows, a cursor spotlight,
 * the animated name and pitch beside the Joker card, then crossing tapes of
 * how I work and the kinds of things I build.
 */
export function Hero({ section, settings, sections }: SectionProps) {
  const c = section.content as HeroContent;
  const name = settings.ownerName || settings.siteName;
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const stack = c.stack ?? [];
  const about = sections.find((s) => s.type === "ABOUT")?.content as { interests?: string[]; traits?: string[] } | undefined;
  const interests = about?.interests ?? [];
  const traits = about?.traits ?? [];

  return (
    <section
      id={section.slug}
      className="relative"
      onPointerMove={(e) => {
        const el = stageRef.current;
        if (!el || e.pointerType !== "mouse") return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {/* Stage background: glows, grid and spotlight (full-bleed) */}
      <div ref={stageRef} aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-40 h-[40rem] w-[40rem] rounded-full bg-secondary/40 blur-[130px]"
          animate={reduce ? undefined : { x: [0, 120, 0], y: [0, 80, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-40 bottom-0 h-[34rem] w-[34rem] rounded-full bg-primary/20 blur-[130px]"
          animate={reduce ? undefined : { x: [0, -100, 0], y: [0, -60, 0], scale: [1.1, 0.95, 1.1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(500px_circle_at_var(--mx,50%)_var(--my,40%),color-mix(in_oklch,var(--primary)_10%,transparent),transparent_60%)]" />
      </div>

      <div className="relative grid min-h-[100svh] items-center gap-14 pt-28 pb-24 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <h1 className="font-display font-extrabold tracking-tight">
            {section.title && (
              <motion.span
                className="mb-3 block font-serif text-3xl font-normal tracking-normal text-muted-foreground italic md:text-4xl"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
              >
                {section.title}
              </motion.span>
            )}
            <span className="block text-[3.2rem] leading-[0.95] sm:text-7xl lg:text-[5.5rem] xl:text-[6.5rem]">
              <AnimatedName name={name} />
            </span>
          </h1>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.7, ease: EASE }}>
            {c.roles && c.roles.length > 0 && (
              <p className="mt-8 text-2xl tracking-tight md:text-3xl">
                {c.rolePrefix ?? "I build"} <RotatingRole items={c.roles} />
              </p>
            )}
            {section.subtitle && <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">{section.subtitle}</p>}

            <div className="mt-10 flex flex-wrap gap-3">
              {c.ctaHref && (
                <Magnetic>
                  <a
                    href={c.ctaHref}
                    className="group inline-flex h-14 items-center gap-2 rounded-full bg-primary px-8 font-semibold text-primary-foreground shadow-[0_0_40px_-8px_var(--primary)] transition-shadow hover:shadow-[0_0_60px_-6px_var(--primary)]"
                  >
                    {c.ctaLabel ?? "See my work"}
                    <ArrowDownRight className="h-5 w-5 transition-transform group-hover:rotate-[-45deg]" aria-hidden />
                  </a>
                </Magnetic>
              )}
              {c.secondaryCtaHref && (
                <Magnetic>
                  <a
                    href={c.secondaryCtaHref}
                    className="inline-flex h-14 items-center rounded-full border-2 border-secondary px-8 font-semibold transition-colors hover:bg-secondary"
                  >
                    {c.secondaryCtaLabel ?? "Get in touch"}
                  </a>
                </Magnetic>
              )}
            </div>
          </motion.div>
          {interests.length > 0 && <Exploring items={interests} />}
        </div>

        <div className="flex flex-col items-center gap-12">
          <motion.div
            initial={{ opacity: 0, rotate: 12, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, rotate: 0, y: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 1.1, ease: EASE }}
          >
            <JokerCard name={name} role={c.badge ?? settings.headline} avatarUrl={settings.avatarUrl} chips={c.cardChips ?? stack.slice(1, 5)} />
          </motion.div>
          <StatusTicket availability={c.availability} openTo={c.openTo ?? []} location={settings.location} timeZone={c.timeZone} />
        </div>

        <motion.a
          href="#about"
          aria-label="Scroll to content"
          className="absolute bottom-8 left-0 hidden items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-muted-foreground uppercase lg:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          <span className="relative h-10 w-px overflow-hidden bg-border">
            <motion.span
              className="absolute inset-x-0 h-1/2 bg-primary"
              animate={reduce ? undefined : { y: ["-100%", "200%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
          Scroll
        </motion.a>
      </div>

      {/* Crossing tapes */}
      {(traits.length > 0 || c.roles?.length) && (
        <div aria-hidden className="relative h-44 md:h-52">
          {c.roles && c.roles.length > 0 && <Tape words={c.roles} tone="purple" reverse className="top-1/2 -translate-y-1/2 rotate-[2.5deg]" />}
          {traits.length > 0 && <Tape words={traits} tone="green" className="top-1/2 -translate-y-1/2 -rotate-[3deg]" />}
        </div>
      )}
    </section>
  );
}
