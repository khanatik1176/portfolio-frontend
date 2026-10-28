"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { SectionItem } from "@/lib/types";
import { SectionFrame, SectionIntro } from "./SectionFrame";
import type { SectionProps } from "./types";

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

const period = (item: SectionItem) =>
  item.startDate ? `${fmt(item.startDate)} — ${item.endDate ? fmt(item.endDate) : "Present"}` : null;

/**
 * Split layout: the heading and a company index stay pinned on the left while
 * the timeline scrolls on the right; the index tracks the role in view.
 */
export function Timeline({ section, index }: SectionProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(section.items[0]?.id);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.getAttribute("data-id")!)),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    listRef.current?.querySelectorAll("[data-id]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionIntro section={section} index={index} />
          <ul className="hidden gap-1 lg:grid">
            {section.items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#exp-${item.id}`}
                  className={`flex items-baseline gap-4 rounded-lg px-4 py-3 transition-colors ${
                    active === item.id ? "bg-card text-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className={`font-mono text-xs ${active === item.id ? "text-highlight" : ""}`}>
                    {item.startDate ? new Date(item.startDate).getUTCFullYear() : ""}
                  </span>
                  <span className="text-lg font-semibold">{item.subtitle}</span>
                  {active === item.id && (
                    <motion.span layoutId="exp-arrow" className="ml-auto text-highlight">
                      →
                    </motion.span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <ol ref={listRef} className="relative space-y-10 pl-10 md:pl-14">
          <span className="absolute top-2 bottom-2 left-[11px] w-px bg-border md:left-[19px]" />
          <motion.span
            style={{ scaleY }}
            className="absolute top-2 bottom-2 left-[11px] w-px origin-top bg-primary shadow-[0_0_10px_var(--primary)] md:left-[19px]"
          />
          {section.items.map((item, i) => (
            <TimelineItem key={item.id} item={item} current={!item.endDate && i === 0} />
          ))}
        </ol>
      </div>
    </SectionFrame>
  );
}

function TimelineItem({ item, current }: { item: SectionItem; current: boolean }) {
  const [open, setOpen] = useState(false);
  const data = item.data as { location?: string; highlights?: string[] };
  const highlights = data.highlights ?? [];
  const visible = open ? highlights : highlights.slice(0, 3);

  return (
    <motion.li
      id={`exp-${item.id}`}
      data-id={item.id}
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative scroll-mt-32"
    >
      <motion.span
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
        className="absolute top-7 -left-10 grid h-6 w-6 place-items-center rounded-full border-2 border-primary bg-background md:-left-14 md:h-10 md:w-10"
      >
        <span className={`h-2 w-2 rounded-full bg-primary md:h-3 md:w-3 ${current ? "animate-ping" : ""}`} />
      </motion.span>

      <div className="rounded-lg border bg-card/70 p-6 backdrop-blur transition-colors hover:border-primary/50 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-xs text-muted-foreground">{period(item)}</p>
          {current && (
            <span className="rounded-lg bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">Now</span>
          )}
        </div>
        <h3 className="mt-2 text-2xl font-bold tracking-tight">{item.title}</h3>
        <p className="font-medium text-highlight">
          {item.subtitle}
          {data.location && <span className="font-normal text-muted-foreground"> · {data.location}</span>}
        </p>
        {item.description && <p className="mt-4 text-muted-foreground">{item.description}</p>}

        {highlights.length > 0 && (
          <ul className="mt-5 space-y-2.5">
            <AnimatePresence initial={false}>
              {visible.map((h) => (
                <motion.li
                  key={h}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-3 overflow-hidden text-sm"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{h}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
        {highlights.length > 3 && (
          <button onClick={() => setOpen(!open)} className="mt-4 font-mono text-xs text-highlight hover:underline">
            {open ? "− Show less" : `+ ${highlights.length - 3} more`}
          </button>
        )}

        {item.tags.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {item.tags.map((t) => (
              <li key={t} className="rounded-md bg-muted px-2 py-1 font-mono text-xs">{t}</li>
            ))}
          </ul>
        )}
      </div>
    </motion.li>
  );
}
