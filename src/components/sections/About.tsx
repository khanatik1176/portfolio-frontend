"use client";

import { motion } from "motion/react";
import { CyberBadge } from "../fx/CyberBadge";
import { CountUp } from "../fx/CountUp";
import { KeywordIcon } from "../fx/KeywordIcon";
import { Reveal } from "../fx/Reveal";
import { SectionFrame } from "./SectionFrame";
import { Transmission } from "./Transmission";
import type { SectionProps } from "./types";

interface AboutContent {
  body?: string;
  stats?: { value: number; suffix?: string; label: string; decimals?: number }[];
  traits?: string[];
  interests?: string[];
}

const CUT = "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))";
const SMALL_CUT = "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))";
const DUAL = "linear-gradient(120deg, var(--primary), var(--chart-3))";

export function About({ section, settings, index }: SectionProps) {
  const c = section.content as AboutContent;
  return (
    <SectionFrame
      section={section}
      index={index}
      decor={
        <>
          <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_60%_40%,black_15%,transparent_70%)]" />
          <div className="absolute top-1/4 -left-24 h-80 w-80 rounded-full bg-chart-2/10 blur-[110px]" />
          <div className="absolute right-0 bottom-10 h-80 w-80 rounded-full bg-chart-3/10 blur-[110px]" />
          <div className="absolute top-20 right-6 hidden md:block lg:right-16">
            <CyberBadge
              text={`about me ◆ ${settings.headline} ◆ `}
              core={(settings.ownerName || settings.siteName)
                .split(" ")
                .map((w) => w[0])
                .join("")}
            />
          </div>
        </>
      }
    >
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {/* Bio as a transmission that decrypts on scroll */}
          <Reveal>
            <Transmission
              text={c.body ?? settings.bio}
              source={`${(settings.ownerName || settings.siteName).split(" ").map((w) => w[0]).join("")}//${settings.location?.split(",").pop()?.trim() ?? "net"}`}
            />
          </Reveal>

          {(c.traits?.length || c.interests?.length) && (
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {c.traits && <ChipGroup label="how_i_work" items={c.traits} />}
              {c.interests && <ChipGroup label="curious_about" items={c.interests} />}
            </div>
          )}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 content-start gap-4">
          {c.stats?.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className="group relative h-full p-px transition-[filter] hover:drop-shadow-[0_0_14px_color-mix(in_oklch,var(--primary)_45%,transparent)]"
                style={{ clipPath: CUT, background: DUAL }}
              >
                <div className="relative h-full overflow-hidden bg-card/95 p-5 sm:p-6" style={{ clipPath: CUT }}>
                  <div aria-hidden className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0_3px,rgb(0_0_0/0.05)_3px_4px)]" />
                  <span aria-hidden className="absolute top-2 right-2 h-3 w-3 border-t-2 border-r-2 border-primary/70" />

                  <span
                    className="relative grid h-10 w-10 place-items-center border border-primary/50 bg-primary/10 text-highlight shadow-[0_0_14px_-4px_var(--primary)] transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                    style={{ clipPath: SMALL_CUT }}
                  >
                    <KeywordIcon label={s.label} className="h-5 w-5" />
                  </span>

                  <p
                    className="relative mt-4 text-4xl font-black tracking-tighter text-highlight sm:text-5xl"
                    style={{ textShadow: "2px 0 color-mix(in oklch, var(--chart-3) 60%, transparent), -2px 0 color-mix(in oklch, var(--chart-2) 60%, transparent)" }}
                  >
                    <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} />
                  </p>
                  <p className="relative mt-2 font-mono text-[11px] leading-snug tracking-wider text-muted-foreground uppercase">{s.label}</p>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionFrame>
  );
}

function ChipGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="mb-3 flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.2em] uppercase">
        <span className="text-highlight">▸</span>
        {label}
        <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
      </p>
      <motion.ul
        className="flex flex-wrap gap-2"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        transition={{ staggerChildren: 0.05 }}
      >
        {items.map((t) => (
          <motion.li
            key={t}
            variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
            className="group flex items-center gap-2 border bg-card/60 px-3 py-1.5 text-sm backdrop-blur transition-[color,border-color,box-shadow] hover:border-primary hover:text-highlight hover:shadow-[0_0_14px_-4px_var(--primary)]"
            style={{ clipPath: SMALL_CUT }}
          >
            <span className="text-chart-3 transition-colors group-hover:text-highlight">
              <KeywordIcon label={t} />
            </span>
            {t}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
