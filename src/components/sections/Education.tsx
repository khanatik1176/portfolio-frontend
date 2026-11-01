"use client";

import { GraduationCap } from "lucide-react";
import { motion } from "motion/react";
import { useId } from "react";
import type { SectionItem } from "@/lib/types";
import { CountUp } from "../fx/CountUp";
import { SectionFrame } from "./SectionFrame";
import { type SectionProps } from "./types";

interface EducationData {
  grade?: string;
  gradeLabel?: string;
  /** Top of the grading scale; defaults to 4 for CGPA and 5 for GPA. */
  gradeMax?: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const year = (d: string | null) => (d ? new Date(d).getUTCFullYear() : null);
const scaleOf = (d: EducationData) => d.gradeMax ?? (/^cgpa$/i.test(d.gradeLabel ?? "") ? 4 : 5);

/** Ring gauge that fills with the grade's share of the scale while the number counts up. */
function GradeRing({ grade, max, label }: { grade: number; max: number; label?: string }) {
  const id = useId();
  return (
    <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--chart-2)" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="8" />
        <motion.circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: Math.min(1, grade / max) }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-sans text-2xl leading-none font-bold tabular-nums sm:text-3xl">
            <CountUp value={grade} decimals={2} />
          </p>
          <p className="mt-1 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
            {label} · /{max.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

function DegreeCard({ item, i }: { item: SectionItem; i: number }) {
  const d = item.data as EducationData;
  const from = year(item.startDate);
  const to = year(item.endDate);
  const grade = Number(d.grade);
  const hasGrade = Boolean(d.grade) && Number.isFinite(grade);
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay: i * 0.25, ease: EASE }}
      whileHover={{ y: -6 }}
      className="group relative h-full rounded-[1.75rem] bg-border p-px transition-shadow duration-500 hover:bg-[linear-gradient(140deg,var(--chart-2),var(--primary))] hover:shadow-[0_24px_60px_-24px_var(--secondary)]"
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(1.75rem-1px)] bg-card p-6 sm:p-8">
        <span aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-secondary/20 blur-3xl transition-opacity duration-500 group-hover:opacity-70" />
        <div className="relative flex items-center justify-between gap-4">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
            <GraduationCap className="h-5 w-5" aria-hidden />
          </span>
          {from && (
            <span className="rounded-full border px-3 py-1 font-mono text-xs text-muted-foreground">
              {to && to !== from ? `${from} – ${to}` : from}
            </span>
          )}
        </div>

        <h3 className="relative mt-6 font-display text-xl leading-tight font-bold tracking-tight sm:text-2xl">{item.title}</h3>
        {item.subtitle && <p className="relative mt-2 font-medium text-primary">{item.subtitle}</p>}
        {item.description && <p className="relative mt-1.5 text-sm text-muted-foreground">{item.description}</p>}

        {hasGrade && (
          <div className="relative mt-auto pt-8">
            <div className="flex items-center gap-5 border-t pt-6 sm:gap-6">
            <GradeRing grade={grade} max={scaleOf(d)} label={d.gradeLabel} />
            <dl className="text-sm">
              <dt className="text-muted-foreground">{d.gradeLabel ?? "Grade"}</dt>
              <dd className="mt-0.5 font-semibold">
                {d.grade} <span className="font-normal text-muted-foreground">out of {scaleOf(d).toFixed(2)}</span>
              </dd>
            </dl>
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
}

/** Animated link between two milestones: a line that draws itself with a travelling dot. */
function Connector() {
  return (
    <div aria-hidden className="flex items-center justify-center py-2 md:py-0">
      <div className="relative h-14 w-px md:h-px md:w-16 lg:w-24">
        <motion.span
          className="absolute inset-0 origin-top bg-[linear-gradient(to_bottom,var(--chart-2),var(--primary))] md:origin-left md:bg-[linear-gradient(to_right,var(--chart-2),var(--primary))]"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
        />
        <motion.span
          className="absolute top-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)] md:top-1/2 md:left-0 md:translate-x-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          animate={{ top: ["0%", "100%"], left: ["0%", "100%"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
        />
      </div>
    </div>
  );
}

/** Degrees as an academic journey: oldest to newest, linked by animated connectors, each with a grade gauge. */
export function Education({ section, index }: SectionProps) {
  const items = [...section.items].sort((a, b) => (year(a.startDate) ?? 0) - (year(b.startDate) ?? 0));
  return (
    <SectionFrame section={section} index={index}>
      <div className="flex flex-col md:flex-row md:items-stretch">
        {items.map((item, i) => (
          <div key={item.id} className="contents">
            {i > 0 && <Connector />}
            <div className="md:flex-1">
              <DegreeCard item={item} i={i} />
            </div>
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}
