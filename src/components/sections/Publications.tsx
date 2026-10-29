"use client";

import { BrainCircuit, Cpu, FileText, Wind, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { SectionItem } from "@/lib/types";
import { SectionFrame } from "./SectionFrame";
import type { SectionProps } from "./types";

const ACCENTS = ["var(--chart-2)", "var(--chart-3)", "var(--primary)"];
const pad = (n: number) => String(n).padStart(2, "0");

const TOPIC_ICONS: [RegExp, LucideIcon][] = [
  [/deep|neural|learning|vision|attention|classification/, BrainCircuit],
  [/air|dust|pollution|environment/, Wind],
  [/arduino|sensor|iot|embedded/, Cpu],
];

/** Topic emblem chosen from the paper's title/tags. */
function TopicIcon({ text, color }: { text: string; color: string }) {
  const Icon = TOPIC_ICONS.find(([re]) => re.test(text.toLowerCase()))?.[1] ?? FileText;
  return <Icon className="h-6 w-6" style={{ color }} strokeWidth={1.6} aria-hidden />;
}

/** "Portable Air Quality Detector…" → "portable-air-quality-detector-using.pdf". */
const fileName = (title: string) =>
  `${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .split("-")
    .filter(Boolean)
    .slice(0, 5)
    .join("-")}.pdf`;

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).toUpperCase() : null;

/** Publications as a classified research archive: each paper is a data file record. */
export function Publications({ section, index }: SectionProps) {
  return (
    <SectionFrame
      section={section}
      index={index}
      decor={
        <>
          <div className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_30%_50%,black_15%,transparent_70%)]" />
          <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-chart-3/10 blur-[110px]" />
        </>
      }
    >
      <p className="-mt-6 mb-10 font-mono text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
        archive <span className="text-highlight">{"//"}</span>{" "}
        <span className="font-bold text-foreground">{pad(section.items.length)}</span> records · access: public
      </p>

      <ol className="grid gap-5">
        {section.items.map((item, i) => (
          <Record key={item.id} item={item} index={i} color={ACCENTS[i % ACCENTS.length]} />
        ))}
      </ol>
    </SectionFrame>
  );
}

function Record({ item, index, color }: { item: SectionItem; index: number; color: string }) {
  const date = fmtDate(item.startDate);
  const venue = item.subtitle;

  return (
    <motion.li
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-xl border bg-card/70 backdrop-blur transition-[border-color,box-shadow] duration-300 hover:shadow-[0_0_40px_-14px_var(--c)]"
      style={{ ["--c" as string]: color }}
    >
      {/* Accent edge + hover border light + scan beam */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: color, boxShadow: `0 0 14px ${color}` }} />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1px ${color}` }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-[left,opacity] duration-700 group-hover:left-full group-hover:opacity-100"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0_3px,rgb(0_0_0/0.07)_3px_4px)]" />

      <div className="relative grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8 md:p-8">
        {/* Index + emblem */}
        <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-3">
          <span className="font-mono text-[11px] font-bold tracking-[0.25em]" style={{ color }}>
            PUB.{pad(index + 1)}
          </span>
          <span className="grid h-14 w-14 place-items-center rounded-xl border bg-background/60" style={{ borderColor: `color-mix(in oklch, ${color} 50%, transparent)`, boxShadow: `0 0 20px -8px ${color}` }}>
            <TopicIcon text={`${item.title} ${item.tags.join(" ")}`} color={color} />
          </span>
        </div>

        {/* Paper */}
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            <span className="flex items-center gap-1.5 normal-case tracking-normal">
              <FileText className="h-3 w-3" aria-hidden /> {fileName(item.title)}
            </span>
            {venue && <span>· {venue}</span>}
            {date && <span>· {date}</span>}
          </p>
          <h3 className="mt-2 text-xl leading-snug font-black tracking-tight md:text-2xl">{item.title}</h3>
          {item.description && <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>}
          {item.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {item.tags.map((t) => (
                <li key={t} className="rounded-md border bg-background/50 px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase">
                  #{t}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Action */}
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="group/link inline-flex shrink-0 items-center gap-2 self-start rounded-lg px-5 py-3 font-mono text-xs font-bold tracking-widest uppercase md:self-center"
            style={{ background: color, color: "var(--background)", boxShadow: `0 0 24px -6px ${color}` }}
          >
            read paper
            <span className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">↗</span>
          </a>
        )}
      </div>
    </motion.li>
  );
}
