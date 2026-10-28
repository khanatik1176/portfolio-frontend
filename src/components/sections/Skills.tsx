"use client";

import { motion } from "motion/react";
import { Marquee } from "../fx/Marquee";
import { TiltCard } from "../fx/TiltCard";
import { SectionFrame } from "./SectionFrame";
import type { SectionProps } from "./types";

export function Skills({ section, index }: SectionProps) {
  const all = section.items.flatMap((i) => i.tags);
  const half = Math.ceil(all.length / 2);

  return (
    <SectionFrame section={section} index={index} surface="sage" className="my-8">
      <div className="-mx-4 mb-16 grid gap-4 sm:-mx-6">
        <Marquee duration={45}>
          {all.slice(0, half).map((t) => <Pill key={t} text={t} />)}
        </Marquee>
        <Marquee duration={50} reverse>
          {all.slice(half).map((t) => <Pill key={t} text={t} />)}
        </Marquee>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {section.items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: (i % 3) * 0.1, duration: 0.6 }}
            className={i === 0 ? "lg:col-span-2" : ""}
          >
            <TiltCard className="h-full p-7">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-bold">{item.title}</h3>
                <span className="font-mono text-xs text-muted-foreground">{String(item.tags.length).padStart(2, "0")}</span>
              </div>
              {item.subtitle && <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>}
              <motion.ul
                className="mt-6 flex flex-wrap gap-2"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ staggerChildren: 0.04, delayChildren: 0.2 }}
              >
                {item.tags.map((tag) => (
                  <motion.li
                    key={tag}
                    variants={{ hidden: { opacity: 0, scale: 0.6 }, show: { opacity: 1, scale: 1 } }}
                    whileHover={{ y: -3 }}
                    className="rounded-lg border bg-background/60 px-3 py-1.5 text-sm transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    {tag}
                  </motion.li>
                ))}
              </motion.ul>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </SectionFrame>
  );
}

function Pill({ text }: { text: string }) {
  return (
    <span className="flex shrink-0 items-center gap-4 text-3xl font-black tracking-tight whitespace-nowrap text-foreground/15 uppercase sm:text-6xl">
      {text}
      <span className="text-highlight">✦</span>
    </span>
  );
}
