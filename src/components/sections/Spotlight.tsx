"use client";

import { motion } from "motion/react";
import { SectionFrame } from "./SectionFrame";
import type { SectionProps } from "./types";

/** Centered showcase with slowly turning light rays; used for CUSTOM sections (e.g. awards). */
export function Spotlight({ section, index }: SectionProps) {
  const body = section.content.body as string | undefined;
  return (
    <SectionFrame
      section={section}
      index={index}
      decor={
        <motion.div
          className="absolute top-1/2 left-1/2 aspect-square w-[160vmax] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(circle,black_5%,transparent_35%)] opacity-60"
          style={{
            background:
              "repeating-conic-gradient(from 0deg, color-mix(in oklch, var(--primary) 22%, transparent) 0deg 6deg, transparent 6deg 18deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        />
      }
    >
      {body && <p className="mx-auto mb-12 max-w-3xl text-center whitespace-pre-line text-muted-foreground">{body}</p>}
      <div className="flex flex-wrap justify-center gap-8">
        {section.items.map((item, i) => {
          const badge = (item.data as { badge?: string }).badge;
          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", stiffness: 120, damping: 14, delay: i * 0.1 }}
              className="relative w-full max-w-xl rounded-lg border bg-card/80 p-10 text-center shadow-2xl backdrop-blur"
            >
              {badge && (
                <motion.p
                  initial={{ scale: 0.4, rotate: -12 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.3 }}
                  className="mx-auto mb-6 grid h-28 w-28 place-items-center rounded-full bg-primary text-5xl font-black tracking-tighter text-primary-foreground shadow-[0_0_60px_-10px_var(--primary)]"
                >
                  {badge}
                </motion.p>
              )}
              {item.subtitle && <p className="font-mono text-xs tracking-wider text-highlight uppercase">{item.subtitle}</p>}
              <h3 className="mt-3 text-3xl font-bold tracking-tight">{item.title}</h3>
              {item.description && <p className="mt-3 text-muted-foreground">{item.description}</p>}
              {item.link && (
                <a href={item.link} target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm font-semibold text-highlight hover:underline">
                  Learn more ↗
                </a>
              )}
            </motion.article>
          );
        })}
      </div>
    </SectionFrame>
  );
}
