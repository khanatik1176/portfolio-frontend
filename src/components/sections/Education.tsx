"use client";

import { motion } from "motion/react";
import { CircularText } from "../fx/CircularText";
import { CountUp } from "../fx/CountUp";
import { SectionFrame } from "./SectionFrame";
import type { SectionProps } from "./types";

const year = (d: string | null) => (d ? new Date(d).getUTCFullYear() : "Present");

/** Diploma-style cards on a striped field; each grade sits inside a spinning seal. */
export function Education({ section, index }: SectionProps) {
  return (
    <SectionFrame
      section={section}
      index={index}
      decor={<div className="bg-stripes absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {section.items.map((item, i) => {
          const data = item.data as { grade?: string; gradeLabel?: string };
          const grade = data.grade ? Number.parseFloat(data.grade) : NaN;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, rotate: i % 2 ? 3 : -3, y: 50 }}
              whileInView={{ opacity: 1, rotate: 0, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="relative overflow-hidden rounded-lg border-2 border-dashed bg-card p-8 shadow-xl"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground">
                    {item.startDate && `${year(item.startDate)} — ${year(item.endDate)}`}
                  </p>
                  <h3 className="mt-3 text-2xl font-bold tracking-tight">{item.title}</h3>
                  <p className="mt-1 text-highlight">{item.subtitle}</p>
                  {item.description && <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>}
                </div>
                {!Number.isNaN(grade) && (
                  <CircularText text={`${data.gradeLabel ?? "grade"} • `.repeat(5)} size={120} duration={14} className="shrink-0 text-highlight">
                    <span className="text-2xl font-black tracking-tighter text-foreground">
                      <CountUp value={grade} decimals={2} />
                    </span>
                  </CircularText>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionFrame>
  );
}
