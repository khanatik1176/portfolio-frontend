"use client";

import { AnimatePresence, animate, motion, useInView, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { SectionItem } from "@/lib/types";
import { SectionFrame, SectionIntro } from "./SectionFrame";
import type { SectionProps } from "./types";

const HEX = "polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0 50%)";
const TAB = "polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)";

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).toUpperCase();

const SMALL_CUT = "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))";

/** "ACI PLC" → "ACI", "Deep Mind Labs" → "DML", "6sense Technologies" → "6T". */
const monogram = (name: string) => {
  const words = name.split(/\s+/).filter(Boolean);
  if (words[0] && words[0].length <= 4 && words[0] === words[0].toUpperCase()) return words[0];
  return words
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
};

/** Company logo tile (item data.logoUrl, a neon-converted logo) with a monogram fallback. */
function CompanyLogo({ item, active }: { item: SectionItem; active: boolean }) {
  const logo = (item.data as { logoUrl?: string }).logoUrl;
  const name = item.subtitle ?? item.title;
  return (
    <span
      className={`grid h-9 w-9 shrink-0 place-items-center overflow-hidden border transition-[border-color,box-shadow] ${
        active ? "border-primary shadow-[0_0_12px_-3px_var(--primary)]" : "border-border"
      } ${logo ? "bg-background p-0.5" : "bg-card"}`}
      style={{ clipPath: SMALL_CUT }}
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={`${name} logo`} className="h-full w-full object-contain" />
      ) : (
        <span className={`font-mono text-[10px] font-black tracking-tight ${active ? "text-highlight" : "text-muted-foreground"}`}>
          {monogram(name)}
        </span>
      )}
    </span>
  );
}

const contractId = (item: SectionItem, i: number) =>
  `CTR-${String(i + 1).padStart(2, "0")} // ${(item.subtitle ?? item.title).toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

// "Now" only exists on the client, so durations of ongoing roles never cause hydration drift.
const subscribeNow = (cb: () => void) => {
  const id = setInterval(cb, 3_600_000);
  return () => clearInterval(id);
};
function useNowMonth() {
  return useSyncExternalStore(
    subscribeNow,
    () => {
      const d = new Date();
      return d.getFullYear() * 12 + d.getMonth();
    },
    () => null,
  );
}

/** Calendar difference from `start` to `now`: whole years, months, days, plus h:m:s. */
function elapsed(start: Date, now: Date) {
  let months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
  let anchor = new Date(start);
  anchor.setMonth(start.getMonth() + months);
  if (anchor > now) {
    months--;
    anchor = new Date(start);
    anchor.setMonth(start.getMonth() + months);
  }
  const rest = Math.floor((now.getTime() - anchor.getTime()) / 1000);
  return {
    years: Math.floor(months / 12),
    months: months % 12,
    days: Math.floor(rest / 86400),
    clock: [Math.floor((rest % 86400) / 3600), Math.floor((rest % 3600) / 60), rest % 60]
      .map((n) => String(n).padStart(2, "0"))
      .join(":"),
  };
}

/**
 * Experience since `since` in plain words ("2 years 2 months"), counting up when
 * it scrolls into view, with a live "14 days · 06:21:09" line ticking below.
 */
function LiveYears({ since }: { since: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [now, setNow] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, 1, { duration: reduce ? 0 : 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: setProgress });
    return () => controls.stop();
  }, [inView, reduce]);

  const e = now === null ? null : elapsed(new Date(since), new Date(now));
  const plural = (n: number, word: string) => `${word}${n === 1 ? "" : "s"}`;
  const years = e ? Math.round(e.years * progress) : 0;
  const months = e ? Math.round(e.months * progress) : 0;

  return (
    <span ref={ref} className="block normal-case">
      <span
        className="flex items-baseline gap-1.5 font-sans text-xl font-black tracking-tight text-highlight tabular-nums"
        style={{ textShadow: "0 0 14px color-mix(in oklch, var(--primary) 45%, transparent)" }}
      >
        {e ? (
          <>
            {years}
            <span className="text-sm font-semibold text-foreground">{plural(years, "year")}</span>
            {months}
            <span className="text-sm font-semibold text-foreground">{plural(months, "month")}</span>
          </>
        ) : (
          "—"
        )}
      </span>
      <span className="mt-1 block text-[11px] tracking-widest text-muted-foreground tabular-nums">
        {e ? `${e.days} ${plural(e.days, "day")} · ${e.clock}` : "\u00a0"}
      </span>
    </span>
  );
}

const monthIndex = (iso: string) => {
  const d = new Date(iso);
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
};

function durationMonths(item: SectionItem, now: number | null) {
  if (!item.startDate) return null;
  const end = item.endDate ? monthIndex(item.endDate) : now;
  return end === null ? null : Math.max(1, end - monthIndex(item.startDate));
}

/**
 * Experience as a mission log: a pinned "mission select" index with a career
 * readout on the left, and each role as a contract dossier on the right along
 * a neon spine that fills as you scroll.
 */
export function Timeline({ section, index }: SectionProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(section.items[0]?.id);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });
  const now = useNowMonth();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.getAttribute("data-id")!)),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    listRef.current?.querySelectorAll("[data-id]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const durations = section.items.map((item) => durationMonths(item, now));
  const longest = Math.max(1, ...durations.map((d) => d ?? 0));
  const firstStart = section.items.map((i) => i.startDate).filter(Boolean).sort()[0];

  return (
    <SectionFrame
      section={section}
      index={index}
      header={false}
      decor={
        <>
          <div className="bg-lanes absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]" />
          {[0.18, 0.52, 0.86].map((left, i) => (
            <motion.span
              key={left}
              className="absolute top-0 h-48 w-px bg-gradient-to-b from-transparent via-primary to-transparent"
              style={{ left: `${left * 100}%` }}
              animate={{ y: ["-20vh", "160vh"] }}
              transition={{ duration: 7 + i * 2, repeat: Infinity, delay: i * 1.7, ease: "linear" }}
            />
          ))}
        </>
      }
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] lg:gap-16">
        {/* Pinned mission select */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionIntro section={section} index={index} />

          <p className="mb-3 hidden font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase lg:block">▸ mission select</p>
          <ul className="hidden border-l lg:block">
            {section.items.map((item, i) => {
              const on = active === item.id;
              return (
                <li key={item.id} className="relative">
                  {on && (
                    <motion.span
                      layoutId="mission-bar"
                      className="absolute inset-y-0 -left-px w-[3px] bg-primary shadow-[0_0_12px_var(--primary)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <a
                    href={`#exp-${item.id}`}
                    className={`flex items-center gap-3 px-5 py-3 font-mono transition-colors ${
                      on ? "bg-primary/[0.06] text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className={`text-xs ${on ? "text-highlight" : ""}`}>{String(i + 1).padStart(2, "0")}</span>
                    <CompanyLogo item={item} active={on} />
                    <span className="font-sans text-lg font-bold">{item.subtitle}</span>
                    <span className="ml-auto text-[10px] tracking-wider">
                      {item.startDate ? new Date(item.startDate).getUTCFullYear() : ""} → {item.endDate ? new Date(item.endDate).getUTCFullYear() : "NOW"}
                    </span>
                    {on && <span className="text-highlight">▶</span>}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Career readout */}
          <dl className="mt-8 grid grid-cols-2 border font-mono text-[10px] tracking-widest uppercase">
            {firstStart && (
              <div className="col-span-2 border-b px-4 py-3">
                <dt className="flex items-center justify-between text-muted-foreground">
                  <span>experience · live</span>
                  <span>since {fmt(firstStart)}</span>
                </dt>
                <dd className="mt-1">
                  <LiveYears since={firstStart} />
                </dd>
              </div>
            )}
            {[
              { label: "contracts", value: String(section.items.length).padStart(2, "0") },
              { label: "status", value: section.items.some((i) => !i.endDate) ? "deployed" : "available" },
            ].map((stat, i) => (
              <div key={stat.label} className={`px-4 py-3 ${i > 0 ? "border-l" : ""}`}>
                <dt className="text-muted-foreground">{stat.label}</dt>
                <dd className="mt-1 text-sm font-bold text-highlight">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Dossiers along the spine */}
        <ol ref={listRef} className="relative space-y-14 pl-12 md:pl-16">
          <span className="absolute top-2 bottom-2 left-[15px] w-px bg-border md:left-[19px]" />
          <motion.span
            style={{ scaleY }}
            className="absolute top-2 bottom-2 left-[15px] w-px origin-top bg-primary shadow-[0_0_10px_var(--primary)] md:left-[19px]"
          />
          {section.items.map((item, i) => (
            <Dossier
              key={item.id}
              item={item}
              index={i}
              current={!item.endDate}
              months={durations[i]}
              longest={longest}
            />
          ))}
        </ol>
      </div>
    </SectionFrame>
  );
}

function Dossier({
  item,
  index,
  current,
  months,
  longest,
}: {
  item: SectionItem;
  index: number;
  current: boolean;
  months: number | null;
  longest: number;
}) {
  const [open, setOpen] = useState(false);
  const data = item.data as { location?: string; highlights?: string[] };
  const objectives = data.highlights ?? [];
  const visible = open ? objectives : objectives.slice(0, 3);

  return (
    <motion.li
      id={`exp-${item.id}`}
      data-id={item.id}
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative scroll-mt-32 pt-6"
    >
      {/* Hex node on the spine */}
      <motion.span
        initial={{ scale: 0, rotate: -90 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 260, delay: 0.15 }}
        className="absolute top-9 -left-12 grid h-8 w-9 place-items-center bg-primary p-[2px] md:-left-16 md:h-10 md:w-11"
        style={{ clipPath: HEX }}
      >
        <span className="grid h-full w-full place-items-center bg-background font-mono text-[10px] font-bold text-highlight" style={{ clipPath: HEX }}>
          {String(index + 1).padStart(2, "0")}
        </span>
      </motion.span>
      {current && (
        <motion.span
          aria-hidden
          className="absolute top-9 -left-12 h-8 w-9 bg-primary/40 md:-left-16 md:h-10 md:w-11"
          style={{ clipPath: HEX }}
          animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      )}

      {/* Folder tab */}
      <span
        className="absolute top-0 left-0 bg-primary py-1 pr-6 pl-3 font-mono text-[10px] font-bold tracking-widest text-primary-foreground"
        style={{ clipPath: TAB }}
      >
        {contractId(item, index)}
      </span>

      <div className="group relative overflow-hidden border border-l-4 border-l-primary bg-card/80 p-6 backdrop-blur transition-[border-color,box-shadow] hover:border-primary/60 hover:shadow-[0_0_30px_-12px_var(--primary)] md:p-8">
        {/* Hatched corner */}
        <span
          aria-hidden
          className="absolute top-0 right-0 h-24 w-24 bg-[repeating-linear-gradient(45deg,var(--border)_0_1px,transparent_1px_7px)] [mask-image:linear-gradient(to_bottom_left,black,transparent_70%)]"
        />

        {/* Status stamp */}
        <span
          className={`absolute top-5 right-5 -rotate-6 border-2 px-2 py-0.5 font-mono text-[11px] font-black tracking-[0.2em] uppercase ${
            current ? "border-primary text-highlight shadow-[0_0_14px_-4px_var(--primary)]" : "border-muted-foreground/40 text-muted-foreground"
          }`}
        >
          {current ? "● active" : "completed"}
        </span>

        <p className="font-mono text-[11px] tracking-widest text-muted-foreground">
          {item.startDate && fmt(item.startDate)} → {item.endDate ? fmt(item.endDate) : "PRESENT"}
        </p>
        <h3 className="mt-2 pr-28 text-2xl font-black tracking-tight uppercase md:text-3xl">{item.title}</h3>
        <p className="mt-1 font-semibold text-highlight">
          @ {item.subtitle}
          {data.location && <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">◎ {data.location}</span>}
        </p>

        {/* Duration meter */}
        <div className="mt-5 flex items-center gap-3 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
          <span>duration</span>
          <span className="relative h-1.5 flex-1 overflow-hidden bg-border">
            <motion.span
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-chart-3 to-primary shadow-[0_0_8px_var(--primary)]"
              initial={{ width: 0 }}
              whileInView={{ width: months ? `${(months / longest) * 100}%` : 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            />
            {/* Segment gaps */}
            <span className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_10px,var(--card)_10px_12px)]" />
          </span>
          <span className="text-foreground">{months ? `${months} mo` : "—"}</span>
        </div>

        {item.description && <p className="mt-5 text-muted-foreground">{item.description}</p>}

        {/* Objectives */}
        {objectives.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
              ▸ objectives <span className="text-highlight">{objectives.length}/{objectives.length}</span>
            </p>
            <ul className="space-y-2.5">
              <AnimatePresence initial={false}>
                {visible.map((h) => (
                  <motion.li
                    key={h}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-3 overflow-hidden text-sm"
                  >
                    <span className="shrink-0 font-mono text-xs leading-5 text-highlight">[✓]</span>
                    <span>{h}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            {objectives.length > 3 && (
              <button onClick={() => setOpen(!open)} className="mt-4 font-mono text-[11px] tracking-wider text-highlight uppercase hover:underline">
                {open ? "− collapse" : `+ ${objectives.length - 3} more objectives`}
              </button>
            )}
          </div>
        )}

        {/* Loadout */}
        {item.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-dashed pt-4">
            <span className="mr-1 font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">loadout:</span>
            {item.tags.map((t) => (
              <span key={t} className="border px-2 py-0.5 font-mono text-[11px] text-foreground/85 transition-colors hover:border-primary hover:text-highlight">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.li>
  );
}
