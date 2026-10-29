"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import type { SectionItem } from "@/lib/types";
import { hasTechIcon, TechIcon } from "../fx/TechIcon";
import { SectionFrame } from "./SectionFrame";
import type { SectionProps } from "./types";

type ProjectData = { featured?: boolean; highlights?: string[]; repoUrl?: string };

// Neon color pair per panel, cycling through the theme accents.
const ACCENTS = [
  ["var(--primary)", "var(--chart-3)"],
  ["var(--chart-2)", "var(--chart-3)"],
  ["var(--chart-3)", "var(--primary)"],
  ["var(--chart-2)", "var(--primary)"],
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Projects as a neon accordion: slim panels side by side (stacked on mobile);
 * the active one expands, shows its details, and gets a light beam running
 * around its border.
 */
export function Projects({ section, index }: SectionProps) {
  const [active, setActive] = useState(0);

  return (
    <SectionFrame
      section={section}
      index={index}
      surface="ink"
      className="my-8"
      decor={
        <>
          <div className="bg-grid absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
          <div className="absolute top-1/3 left-1/4 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[130px]" />
          <div className="absolute right-0 bottom-0 h-[380px] w-[380px] rounded-full bg-chart-3/10 blur-[130px]" />
        </>
      }
    >
      <div className="flex flex-col gap-3 lg:h-[36rem] lg:flex-row">
        {section.items.map((item, i) => (
          <Panel
            key={item.id}
            item={item}
            index={i}
            total={section.items.length}
            active={i === active}
            onActivate={() => setActive(i)}
          />
        ))}
      </div>
    </SectionFrame>
  );
}

function Panel({
  item,
  index,
  total,
  active,
  onActivate,
}: {
  item: SectionItem;
  index: number;
  total: number;
  active: boolean;
  onActivate: () => void;
}) {
  const reduce = useReducedMotion();
  const data = item.data as ProjectData;
  const [a, b] = ACCENTS[index % ACCENTS.length];

  return (
    <motion.article
      onMouseEnter={onActivate}
      onFocus={onActivate}
      animate={{ flexGrow: active ? 5 : 1 }}
      transition={{ duration: reduce ? 0 : 0.6, ease: EASE }}
      className={`group relative min-w-0 overflow-hidden rounded-2xl border bg-card/70 backdrop-blur lg:basis-0 ${
        active ? "" : "cursor-pointer hover:bg-card"
      }`}
      style={{ ["--a" as string]: a, ["--b" as string]: b }}
    >
      {/* Accent edge + light beam around the active panel */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ background: "linear-gradient(to bottom, var(--a), var(--b))", boxShadow: "0 0 12px var(--a)" }} />
      {active && !reduce && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl p-[1.5px]"
          style={{ WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }}
        >
          <motion.span
            className="absolute top-1/2 left-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2"
            style={{ background: "conic-gradient(from 0deg, transparent 0 68%, var(--a) 86%, var(--b) 100%)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </span>
      )}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0_3px,rgb(0_0_0/0.08)_3px_4px)]" />

      {/* Collapsed: header row (mobile) / vertical stripe (desktop) */}
      <button
        type="button"
        onClick={onActivate}
        aria-expanded={active}
        className={`relative flex w-full items-center gap-4 px-5 py-4 text-left lg:absolute lg:inset-0 lg:flex-col lg:items-center lg:justify-between lg:px-0 lg:py-6 ${
          active ? "lg:pointer-events-none lg:opacity-0" : "lg:opacity-100"
        } transition-opacity duration-300`}
      >
        <span className="font-mono text-xs font-bold" style={{ color: "var(--a)" }}>
          {pad(index + 1)}
        </span>
        <span className="min-w-0 flex-1 truncate text-lg font-black tracking-tight uppercase lg:flex-none lg:rotate-180 lg:text-xl lg:[writing-mode:vertical-rl]">
          {item.title}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground lg:[writing-mode:vertical-rl]">{active ? "▾" : "▸"}</span>
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {active && (
          <motion.div
            key="content"
            initial={{ opacity: 0, x: reduce ? 0 : 24 }}
            animate={{ opacity: 1, x: 0, transition: { delay: reduce ? 0 : 0.25, duration: 0.4, ease: EASE } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="relative flex h-full flex-col px-6 pb-6 lg:min-w-[34rem] lg:p-9"
          >
            {/* Giant outlined index */}
            <span
              aria-hidden
              className="pointer-events-none absolute -top-4 right-4 text-[9rem] leading-none font-black select-none"
              style={{ color: "transparent", WebkitTextStroke: "1px color-mix(in oklch, var(--a) 40%, transparent)" }}
            >
              {pad(index + 1)}
            </span>

            <p className="hidden font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase lg:block">
              project {pad(index + 1)} / {pad(total)}
            </p>
            {item.subtitle && (
              <p className="mt-3 font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--a)" }}>
                {item.subtitle}
              </p>
            )}
            <h3 className="relative mt-2 max-w-xl text-3xl leading-tight font-black tracking-tight md:text-4xl">{item.title}</h3>
            {item.description && <p className="relative mt-4 max-w-xl text-muted-foreground">{item.description}</p>}

            {data.highlights && data.highlights.length > 0 && (
              <ol className="relative mt-6 max-w-xl space-y-2.5">
                {data.highlights.map((h, i) => (
                  <motion.li
                    key={h}
                    initial={{ opacity: 0, x: reduce ? 0 : 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduce ? 0 : 0.35 + i * 0.07 }}
                    className="flex items-baseline gap-3 border-b border-dashed pb-2.5 text-sm"
                  >
                    <span className="font-mono text-[10px]" style={{ color: "var(--a)" }}>
                      {pad(i + 1)}
                    </span>
                    {h}
                  </motion.li>
                ))}
              </ol>
            )}

            <div className="relative mt-auto flex flex-wrap items-center justify-between gap-4 pt-6">
              <ul className="flex flex-wrap items-center gap-2">
                {item.tags.map((t) =>
                  hasTechIcon(t) ? (
                    <li key={t} title={t} className="grid h-9 w-9 place-items-center rounded-lg border bg-background/60">
                      <TechIcon name={t} className="h-4 w-4" />
                    </li>
                  ) : (
                    <li key={t} className="rounded-lg border bg-background/60 px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground uppercase">
                      {t}
                    </li>
                  ),
                )}
              </ul>
              <div className="flex gap-2">
                {data.repoUrl && <CardLink href={data.repoUrl} label="Code" />}
                {item.link && <CardLink href={item.link} label="Visit" />}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function CardLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group/link inline-flex items-center gap-1 rounded-lg px-4 py-2 font-mono text-xs font-bold tracking-widest uppercase"
      style={{ background: "var(--a)", color: "var(--background)", boxShadow: "0 0 20px -6px var(--a)" }}
    >
      {label}
      <span className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">↗</span>
    </a>
  );
}
