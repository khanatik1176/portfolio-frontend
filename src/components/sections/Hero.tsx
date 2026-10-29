"use client";

import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { Marquee } from "../fx/Marquee";
import { SplitText } from "../fx/SplitText";
import { HeroCard } from "./HeroCard";
import { HeroPortrait } from "./HeroPortrait";
import type { SectionProps } from "./types";

interface HeroContent {
  badge?: string;
  rolePrefix?: string;
  roles?: string[];
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  stack?: string[];
  chips?: { value: string; label: string }[];
  timeZone?: string;
  availability?: string;
  openTo?: string[];
  currentRole?: { title: string; company: string; since?: string; summary?: string };
}

export function Hero({ section, settings }: Omit<SectionProps, "index">) {
  const c = section.content as HeroContent;
  const ref = useRef<HTMLElement>(null);
  const name = settings.ownerName || settings.siteName;

  // Scroll: content drifts down and fades as the hero leaves.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Pointer: normalized -1..1 for portrait parallax, pixels for the spotlight.
  const mx = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const my = useSpring(useMotionValue(0), { stiffness: 60, damping: 18 });
  const px = useMotionValue(-999);
  const py = useMotionValue(-999);
  const spotlight = useMotionTemplate`radial-gradient(480px circle at ${px}px ${py}px, color-mix(in oklch, var(--chart-3) 12%, transparent), transparent 70%)`;

  const marqueeText = [settings.headline, ...(c.roles ?? [])].filter(Boolean);

  return (
    <section
      ref={ref}
      id={section.slug}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
        my.set(((e.clientY - r.top) / r.height) * 2 - 1);
        px.set(e.clientX - r.left);
        py.set(e.clientY - r.top);
      }}
      className="relative flex min-h-svh items-center overflow-clip pt-28 pb-40"
    >
      {/* Hero-only backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,black_10%,transparent_65%)]" />
        <motion.div
          className="absolute top-[5%] right-[5%] h-[520px] w-[520px] rounded-full bg-chart-3/15 blur-[130px]"
          animate={{ scale: [1, 1.2, 1], x: [0, -60, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -left-24 h-[460px] w-[460px] rounded-full bg-chart-2/15 blur-[130px]"
          animate={{ x: [0, 90, 0], y: [0, -50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div className="absolute inset-0" style={{ background: spotlight }} />
      </div>

      <motion.div
        style={{ y, opacity }}
        className="relative mx-auto grid w-full max-w-[1536px] grid-cols-1 items-center gap-20 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-10 lg:px-8"
      >
        <div>
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="font-mono text-highlight"
          >
            {section.title}
          </motion.p>
          <h1 className="mt-2 text-[clamp(3rem,8vw,7.5rem)] leading-[0.92] font-extrabold tracking-tighter">
            <SplitText text={name} delay={0.15} />
          </h1>

          {section.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95 }}
              className="mt-6 max-w-xl text-lg text-muted-foreground"
            >
              {section.subtitle}
            </motion.p>
          )}

          <div className="mt-10">
            <HeroCard
              rolePrefix={c.rolePrefix}
              roles={c.roles ?? []}
              availability={c.availability}
              openTo={c.openTo ?? []}
              currentRole={c.currentRole}
              location={settings.location}
              timeZone={c.timeZone ?? "UTC"}
              primaryCta={c.ctaLabel && c.ctaHref ? { label: c.ctaLabel, href: c.ctaHref } : undefined}
              secondaryCta={
                c.secondaryCtaLabel && c.secondaryCtaHref ? { label: c.secondaryCtaLabel, href: c.secondaryCtaHref } : undefined
              }
              socials={settings.socials}
              email={settings.email}
            />
          </div>
        </div>

        {settings.avatarUrl && (
          <HeroPortrait src={settings.avatarUrl} alt={name} stack={c.stack ?? []} chips={c.chips ?? []} mx={mx} my={my} />
        )}
      </motion.div>

      {/* Giant outlined ticker along the bottom */}
      {marqueeText.length > 0 && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-4 select-none">
          <Marquee duration={70}>
            {marqueeText.map((t) => (
              <span key={t} className="text-outline flex shrink-0 items-center gap-6 pr-6 text-6xl font-black tracking-tighter whitespace-nowrap uppercase sm:text-8xl">
                {t} <span className="text-highlight/50 [-webkit-text-stroke:0]">✦</span>
              </span>
            ))}
          </Marquee>
        </div>
      )}
    </section>
  );
}
