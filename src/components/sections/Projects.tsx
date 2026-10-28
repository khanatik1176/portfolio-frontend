"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { SectionItem } from "@/lib/types";
import { TiltCard } from "../fx/TiltCard";
import { SectionFrame, SectionIntro } from "./SectionFrame";
import type { SectionProps } from "./types";

type ProjectData = { featured?: boolean; highlights?: string[]; repoUrl?: string };

/**
 * Dark panel where vertical scrolling drives the cards sideways (desktop).
 * The section grows by exactly the track's overflow, and the inner panel
 * sticks while the track translates. On small screens cards simply stack.
 */
export function Projects({ section, index }: SectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track || !window.matchMedia("(min-width: 1024px)").matches) return setDistance(0);
      setDistance(Math.max(0, track.scrollWidth - track.parentElement!.clientWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [section.items.length]);

  const { scrollYProgress } = useScroll({ target: scrollRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const x = useTransform(progress, [0, 1], [0, -distance]);
  const orbX = useTransform(progress, [0, 1], ["-10%", "70%"]);

  return (
    <SectionFrame
      section={section}
      index={index}
      surface="ink"
      header={false}
      className="my-8"
      decor={
        <>
          <div className="bg-grid absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
          <motion.div style={{ x: orbX }} className="absolute top-1/3 h-[480px] w-[480px] rounded-full bg-primary/15 blur-[130px]" />
        </>
      }
    >
      <div ref={scrollRef} style={distance ? { height: `calc(100vh + ${distance}px)` } : undefined}>
        <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionIntro section={section} index={index} />
            </div>
            {distance > 0 && (
              <div className="mb-14 hidden w-64 lg:block">
                <p className="mb-2 font-mono text-xs text-muted-foreground">Scroll to explore →</p>
                <div className="h-1 overflow-hidden rounded-full bg-border">
                  <motion.div style={{ scaleX: progress }} className="h-full origin-left bg-primary" />
                </div>
              </div>
            )}
          </div>
          <div className="lg:overflow-visible">
            <motion.div ref={trackRef} style={{ x }} className="flex flex-col gap-6 lg:w-max lg:flex-row">
              {section.items.map((item, i) => (
                <ProjectCard key={item.id} item={item} index={i} />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}

function ProjectCard({ item, index }: { item: SectionItem; index: number }) {
  const data = item.data as ProjectData;
  const featured = Boolean(data.featured);
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={featured ? "lg:w-[min(780px,58vw)]" : "lg:w-[min(520px,40vw)]"}
    >
      <TiltCard className="flex h-full flex-col p-7 md:p-9">
        <span
          aria-hidden
          className="text-outline pointer-events-none absolute -right-2 -bottom-10 text-[9rem] leading-none font-black opacity-60 select-none"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        {item.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="mb-6 aspect-video w-full rounded-lg border object-cover" />
        )}
        {item.subtitle && <p className="font-mono text-xs tracking-wider text-highlight uppercase">{item.subtitle}</p>}
        <h3 className={`mt-3 font-bold tracking-tight ${featured ? "text-3xl md:text-4xl" : "text-2xl"}`}>{item.title}</h3>
        {item.description && <p className="mt-4 max-w-2xl text-muted-foreground">{item.description}</p>}
        {data.highlights && (
          <ul className={`mt-6 grid gap-2 text-sm ${featured ? "sm:grid-cols-3" : ""}`}>
            {data.highlights.map((h) => (
              <li key={h} className="flex items-center gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-[10px] text-highlight">✓</span>
                {h}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-7">
          {item.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {item.tags.map((t) => (
                <li key={t} className="rounded-md border bg-background/60 px-2 py-1 font-mono text-xs">{t}</li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            {data.repoUrl && <CardLink href={data.repoUrl} label="Code" />}
            {item.link && <CardLink href={item.link} label="Visit" />}
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

function CardLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group/link inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
    >
      {label}
      <span className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">↗</span>
    </a>
  );
}
