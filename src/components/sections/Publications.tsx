"use client";

import { ArrowUpRight, BrainCircuit, Cpu, FileText, Wind, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { TiltCard } from "../fx/TiltCard";
import { SectionFrame } from "./SectionFrame";
import { fmtMonth, pad, type SectionProps } from "./types";

const TOPIC_ICONS: [RegExp, LucideIcon][] = [
  [/deep|neural|learning|vision|attention|classification/, BrainCircuit],
  [/air|dust|pollution|environment/, Wind],
  [/arduino|sensor|iot|embedded/, Cpu],
];

/** Topic icon inside a slowly spinning purple-green ring. */
function TopicOrb({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const Icon = TOPIC_ICONS.find(([re]) => re.test(text.toLowerCase()))?.[1] ?? FileText;
  return (
    <span className="relative grid h-16 w-16 shrink-0 place-items-center">
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,var(--secondary),var(--primary),var(--chart-4),var(--secondary))] p-[2px]"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <span className="block h-full w-full rounded-full bg-card" />
      </motion.span>
      <Icon className="relative h-7 w-7 text-primary" strokeWidth={1.6} aria-hidden />
    </span>
  );
}

/**
 * Papers as stacked pages: the sheets behind fan out on hover, the title gets
 * a highlighter swipe as it scrolls in, and the whole card links to the paper.
 */
export function Publications({ section, index }: SectionProps) {
  return (
    <SectionFrame section={section} index={index}>
      <ol className="grid gap-10 md:grid-cols-2 md:gap-8">
        {section.items.map((item, i) => {
          const meta = [item.subtitle, item.startDate && fmtMonth(item.startDate)].filter(Boolean).join(" · ");
          const body = (
            <TiltCard className="h-full rounded-[1.75rem] border bg-card p-6 sm:p-8" max={5}>
              <div className="relative flex items-start justify-between gap-4">
                <TopicOrb text={`${item.title} ${item.tags.join(" ")}`} />
                <div className="text-right font-mono text-[11px] text-muted-foreground">
                  <p className="tracking-[0.25em] text-primary uppercase">Paper {pad(i + 1)}</p>
                  {meta && <p className="mt-1">{meta}</p>}
                </div>
              </div>

              <h3 className="relative mt-7 font-serif text-2xl leading-snug sm:text-[1.9rem]">
                <motion.span
                  className="[box-decoration-break:clone] bg-[linear-gradient(transparent_62%,color-mix(in_oklch,var(--primary)_32%,transparent)_62%)] bg-no-repeat px-0.5 [-webkit-box-decoration-break:clone]"
                  initial={{ backgroundSize: "0% 100%" }}
                  whileInView={{ backgroundSize: "100% 100%" }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 1.4, delay: 0.3 + i * 0.15, ease: [0.65, 0, 0.35, 1] }}
                >
                  {item.title}
                </motion.span>
              </h3>
              {item.description && <p className="relative mt-3 text-sm text-muted-foreground">{item.description}</p>}

              {item.tags.length > 0 && (
                <p className="relative mt-6 font-mono text-xs leading-relaxed text-muted-foreground">
                  <span className="text-chart-2">Keywords —</span> {item.tags.join(" · ")}
                </p>
              )}

              {item.link && (
                <span className="relative mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_-6px_var(--primary)] transition-transform group-hover:translate-x-1">
                  Read the paper
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" aria-hidden />
                </span>
              )}
            </TiltCard>
          );
          return (
            <motion.li
              key={item.id}
              className="group/stack relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Sheets underneath that fan out on hover */}
              <span
                aria-hidden
                className="absolute inset-0 rotate-[2.5deg] rounded-[1.75rem] border bg-secondary/25 transition-transform duration-500 group-hover/stack:translate-x-3 group-hover/stack:rotate-[5deg]"
              />
              <span
                aria-hidden
                className="absolute inset-0 -rotate-[1.5deg] rounded-[1.75rem] border bg-primary/10 transition-transform duration-500 group-hover/stack:-translate-x-3 group-hover/stack:-rotate-[4deg]"
              />
              {item.link ? (
                <a href={item.link} target="_blank" rel="noreferrer" className="relative block h-full rounded-[1.75rem]">
                  {body}
                </a>
              ) : (
                <div className="relative h-full">{body}</div>
              )}
            </motion.li>
          );
        })}
      </ol>
    </SectionFrame>
  );
}
