"use client";

import { ArrowUp, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { SocialLink } from "@/lib/types";
import { LiveClock } from "./LiveClock";
import { LogoMark } from "./Logo";
import { Signature } from "./Signature";
import { SocialIcon } from "./SocialIcon";

interface FooterProps {
  name: string;
  headline: string;
  availability: string | null;
  location: string | null;
  timeZone: string | null;
  email: string | null;
  socials: SocialLink[];
  links: { slug: string; label: string }[];
}

const RING = "BACK TO TOP ✦ BACK TO TOP ✦ ";

/** Circular "back to top" badge whose lettering slowly orbits an arrow. */
function BackToTop() {
  const reduce = useReducedMotion();
  return (
    <a href="#" aria-label="Back to top" className="group relative grid h-24 w-24 shrink-0 place-items-center">
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        aria-hidden
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <path id="footer-ring" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
        </defs>
        <text className="fill-muted-foreground font-mono text-[9.5px] tracking-[0.18em] transition-colors group-hover:fill-primary">
          <textPath href="#footer-ring">{RING}</textPath>
        </text>
      </motion.svg>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0_24px_-4px_var(--primary)] transition-transform group-hover:-translate-y-1">
        <ArrowUp className="h-5 w-5" aria-hidden />
      </span>
    </a>
  );
}

function FooterLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group inline-flex items-center gap-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="h-px w-0 bg-primary transition-all duration-300 group-hover:w-4" />
      {children}
    </a>
  );
}

/**
 * Closing scene: identity and live status, the self-writing signature at the
 * center, link columns, then a bottom bar with the orbiting back-to-top badge.
 */
export function SiteFooter({ name, headline, availability, location, timeZone, email, socials, links }: FooterProps) {
  const reduce = useReducedMotion();
  const surname = name.split(" ").slice(-1)[0];

  return (
    <footer className="relative mt-16 overflow-hidden">
      {/* Top edge: a light that sweeps along the border */}
      <div className="relative h-px bg-border">
        <motion.span
          aria-hidden
          className="absolute inset-y-0 w-1/3 bg-[linear-gradient(90deg,transparent,var(--primary),var(--chart-2),transparent)]"
          animate={reduce ? undefined : { left: ["-33%", "100%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
        />
      </div>
      <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[60rem] max-w-full -translate-x-1/2 rounded-full bg-secondary/20 blur-[120px]" />

      <div className="relative mx-auto grid max-w-[110rem] gap-12 px-4 pt-16 pb-10 md:grid-cols-2 lg:grid-cols-[1fr_1.3fr_1fr] lg:items-center lg:px-8">
        {/* Identity and live status */}
        <div className="order-2 lg:order-1">
          <div className="flex items-center gap-3">
            <LogoMark className="h-12 w-12" />
            <div>
              <p className="font-display text-lg font-bold tracking-tight">{name}</p>
              <p className="text-sm text-muted-foreground">{headline}</p>
            </div>
          </div>
          {(availability || location) && (
            <p className="mt-6 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border bg-card/60 px-4 py-2 text-sm">
              {availability && (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70 motion-reduce:hidden" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <span>{availability}</span>
                </>
              )}
              {timeZone && location && (
                <span className="text-muted-foreground">
                  · <LiveClock timeZone={timeZone} /> in {location.split(",").slice(-1)[0].trim()}
                </span>
              )}
            </p>
          )}
        </div>

        {/* Signature */}
        <div className="order-1 mx-auto w-full max-w-md md:col-span-2 lg:order-2 lg:col-span-1">
          <Signature text={surname} />
        </div>

        {/* Link columns */}
        <nav aria-label="Footer" className="order-3 grid grid-cols-2 gap-8 lg:justify-self-end">
          <div>
            <p className="mb-3 font-mono text-[11px] tracking-[0.25em] text-primary uppercase">Explore</p>
            <ul>
              {links.map((l) => (
                <li key={l.slug}>
                  <FooterLink href={`#${l.slug}`}>{l.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 font-mono text-[11px] tracking-[0.25em] text-primary uppercase">Connect</p>
            <ul>
              {socials.map((s) => (
                <li key={s.url}>
                  <FooterLink href={s.url} external>
                    <SocialIcon platform={s.platform} className="h-3.5 w-3.5" />
                    <span className="capitalize">{s.platform}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </FooterLink>
                </li>
              ))}
              {email && (
                <li>
                  <FooterLink href={`mailto:${email}`}>
                    <SocialIcon platform="email" className="h-3.5 w-3.5" />
                    Email
                  </FooterLink>
                </li>
              )}
            </ul>
          </div>
        </nav>
      </div>

      <div className="relative mx-auto flex max-w-[110rem] flex-wrap items-center justify-between gap-6 border-t border-dashed px-4 py-6 text-sm text-muted-foreground lg:px-8">
        <p>© {name}. All rights reserved.</p>
        <p className="hidden md:block">
          Press <kbd className="rounded border px-1.5 py-0.5 font-mono text-xs">⌘K</kbd> to jump anywhere
        </p>
        <BackToTop />
      </div>
    </footer>
  );
}
