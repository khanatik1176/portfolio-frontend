"use client";

import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { SectionItem } from "@/lib/types";
import { CardIndex } from "../fx/CardIndex";
import { KineticTitle } from "../fx/KineticTitle";
import { ProjectPreview } from "../fx/ProjectPreview";
import { SocialIcon } from "../fx/SocialIcon";
import { labelFromSlug, pad, type SectionProps } from "./types";

interface ProjectData {
  featured?: boolean;
  highlights?: string[];
  repoUrl?: string;
}

const TONES = ["var(--secondary)", "var(--primary)", "var(--chart-4)", "var(--chart-2)"];

function ProjectCard({ item, i, total }: { item: SectionItem; i: number; total: number }) {
  const d = item.data as ProjectData;
  const tone = TONES[i % TONES.length];
  return (
    <article
      id={item.id}
      className="group relative flex w-full shrink-0 scroll-mt-24 flex-col gap-8 overflow-hidden rounded-[2rem] border bg-card p-6 md:p-10 lg:min-h-[min(78vh,44rem)] lg:w-[min(86vw,68rem)] lg:flex-row lg:items-center lg:gap-12"
      style={{ ["--tone" as string]: tone }}
    >
      <span aria-hidden className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full opacity-30 blur-[100px] transition-opacity duration-700 group-hover:opacity-60" style={{ background: tone }} />
      <div className="absolute top-6 right-6 z-10">
        <CardIndex value={pad(i + 1)} size="sm" />
      </div>

      <div className="relative lg:w-[42%]">
        <p className="flex flex-wrap items-center gap-2 pr-16 font-mono text-xs text-muted-foreground lg:pr-0">
          <span>
            {pad(i + 1)} / {pad(total)}
          </span>
          {item.subtitle && <span className="rounded-full border px-2.5 py-0.5">{item.subtitle}</span>}
          {d.featured && <span className="rounded-full bg-primary px-2.5 py-0.5 font-sans font-semibold text-primary-foreground">Featured</span>}
        </p>
        <h3 className="mt-5 font-display text-3xl leading-[1.05] font-bold tracking-tight md:text-5xl">{item.title}</h3>
        {item.description && <p className="mt-4 leading-relaxed text-muted-foreground">{item.description}</p>}
        {d.highlights && d.highlights.length > 0 && (
          <ul className="mt-6 grid gap-2.5">
            {d.highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 text-sm">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full" style={{ background: tone, color: "var(--primary-foreground)" }}>
                  <Check className="h-3 w-3" aria-hidden />
                </span>
                {h}
              </li>
            ))}
          </ul>
        )}
        <ul className="mt-6 flex flex-wrap gap-1.5">
          {item.tags.map((t) => (
            <li key={t} className="rounded-full border bg-background/60 px-2.5 py-0.5 text-xs text-muted-foreground">
              {t}
            </li>
          ))}
        </ul>
        {(item.link || d.repoUrl) && (
          <div className="mt-6 flex gap-4 text-sm font-semibold">
            {item.link && (
              <a href={item.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                Visit <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            )}
            {d.repoUrl && (
              <a href={d.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <SocialIcon platform="github" className="h-4 w-4" /> Source
              </a>
            )}
          </div>
        )}
      </div>

      <div className="relative flex-1 [perspective:1200px]">
        <div className="transition-transform duration-700 ease-out group-hover:[transform:rotateY(-6deg)_rotateX(3deg)_scale(1.02)]">
          <ProjectPreview item={item} className="shadow-[0_30px_80px_-30px_var(--tone)]" />
        </div>
      </div>
    </article>
  );
}

/**
 * Projects as a horizontal gallery: on large screens the section pins and
 * vertical scrolling slides the cards sideways; on small screens they stack.
 */
export function Projects({ section, index }: SectionProps) {
  const isFeatured = (i: SectionItem) => Boolean((i.data as ProjectData).featured);
  const items = [...section.items].sort((a, b) => Number(isFeatured(b)) - Number(isFeatured(a)));

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useSpring(
    useTransform(scrollYProgress, (p) => -p * distance),
    { stiffness: 140, damping: 30, mass: 0.4 },
  );
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // How far the track must travel; zero when the cards stack (small screens).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const wide = window.matchMedia("(min-width: 1024px)").matches;
      setDistance(wide ? Math.max(0, track.scrollWidth - window.innerWidth + 48) : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // A link to #<project id> scrolls to where that card is in view.
  useEffect(() => {
    if (!distance) return;
    const onHash = () => {
      const card = document.getElementById(window.location.hash.slice(1));
      const sectionEl = sectionRef.current;
      if (!card || !sectionEl || !trackRef.current?.contains(card)) return;
      const p = Math.min(1, Math.max(0, (card.offsetLeft - window.innerWidth * 0.08) / distance));
      window.scrollTo({ top: sectionEl.offsetTop + p * distance, behavior: "smooth" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [distance]);

  return (
    <section
      ref={sectionRef}
      id={section.slug}
      className="relative left-1/2 w-screen -translate-x-1/2 scroll-mt-0"
      style={distance ? { height: `calc(${distance}px + 100vh)` } : undefined}
    >
      <div className="py-24 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:overflow-hidden lg:py-0">
        <motion.div ref={trackRef} style={{ x: distance ? x : 0 }} className="flex flex-col gap-6 px-4 sm:px-6 lg:w-max lg:flex-row lg:items-center lg:gap-8 lg:pr-24 lg:pl-[max(2rem,calc((100vw-110rem)/2+2rem))]">
          {/* Intro panel */}
          <div className="relative shrink-0 lg:w-[26rem]">
            <p className="mb-5 flex items-center gap-3 font-mono text-xs">
              <span className="h-px w-8 bg-primary" />
              <span className="tracking-[0.25em] text-primary uppercase">
                {pad(index)} · {labelFromSlug(section.slug)}
              </span>
            </p>
            <h2 className="font-display text-5xl leading-[1.02] font-bold tracking-tight md:text-7xl">
              <KineticTitle text={section.title} />
            </h2>
            {section.subtitle && <p className="mt-5 max-w-sm text-lg text-muted-foreground">{section.subtitle}</p>}
            <p className="mt-10 hidden items-center gap-3 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase lg:flex">
              Keep scrolling
              <motion.span animate={{ x: [0, 8, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
                <ArrowRight className="h-4 w-4 text-primary" aria-hidden />
              </motion.span>
            </p>
          </div>

          {items.map((item, i) => (
            <ProjectCard key={item.id} item={item} i={i} total={items.length} />
          ))}
        </motion.div>

        {distance > 0 && (
          <div className="mx-auto mt-10 hidden h-1 w-64 overflow-hidden rounded-full bg-border lg:block">
            <motion.div className="h-full origin-left bg-[linear-gradient(90deg,var(--secondary),var(--primary))]" style={{ scaleX: bar }} />
          </div>
        )}
      </div>
    </section>
  );
}
