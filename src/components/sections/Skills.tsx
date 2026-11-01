"use client";

import { motion } from "motion/react";
import { TechIcon } from "../fx/TechIcon";
import { SectionFrame } from "./SectionFrame";
import { pad, type SectionProps } from "./types";

const TONES = ["var(--primary)", "var(--chart-2)", "var(--chart-4)", "var(--chart-3)", "var(--chart-5)"];

/**
 * The toolbox: one card per category. Every technology is dealt in with a
 * stagger and lifts with a glow in its category's color on hover.
 */
export function Skills({ section, index }: SectionProps) {
  return (
    <SectionFrame section={section} index={index}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {section.items.map((group, gi) => {
          const tone = TONES[gi % TONES.length];
          return (
            <motion.article
              key={group.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (gi % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group/card relative overflow-hidden rounded-3xl border bg-card p-5 transition-colors hover:border-[color-mix(in_oklch,var(--tone)_45%,transparent)] sm:p-6"
              style={{ ["--tone" as string]: tone }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-25 blur-3xl transition-opacity duration-500 group-hover/card:opacity-50"
                style={{ background: tone }}
              />
              <header className="relative flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-bold tracking-tight">{group.title}</h3>
                  {group.subtitle && <p className="mt-1 text-sm text-muted-foreground">{group.subtitle}</p>}
                </div>
                <span className="shrink-0 rounded-full border px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                  {pad(group.tags.length)} tools
                </span>
              </header>
              <ul className="relative mt-5 flex flex-wrap gap-2">
                {group.tags.map((tag, ti) => (
                  <motion.li
                    key={tag}
                    initial={{ opacity: 0, scale: 0.6, y: 10 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 + ti * 0.04 }}
                    whileHover={{ y: -4, scale: 1.06 }}
                    className="flex cursor-default items-center gap-2 rounded-full border bg-background/70 px-3.5 py-1.5 text-sm transition-[border-color,box-shadow] hover:border-[var(--tone)] hover:shadow-[0_6px_20px_-6px_var(--tone)]"
                  >
                    <TechIcon name={tag} className="h-4 w-4" decorative />
                    {tag}
                  </motion.li>
                ))}
              </ul>
            </motion.article>
          );
        })}
      </div>
    </SectionFrame>
  );
}
