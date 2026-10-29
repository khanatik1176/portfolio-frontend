"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { SocialLink } from "@/lib/types";
import { CyberWords } from "../fx/CyberWords";
import { LiveClock } from "../fx/LiveClock";
import { Magnetic } from "../fx/Magnetic";
import { SocialIcon } from "../fx/SocialIcon";
import { CircuitRoles } from "../fx/CircuitRoles";
import { Uptime } from "../fx/Uptime";

const ROLE_MS = 3200;
const CUT =
  "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))";
const DUAL = "linear-gradient(120deg, var(--primary), var(--chart-3))";

interface Cta {
  label: string;
  href: string;
}

/**
 * Calm, merged hero card: availability + local time, the "I build ..." line,
 * a circuit board routing a data packet to each open-to role, the current job, then the CTAs and
 * social icons. Chamfered glass surface with a dual-color edge.
 */
export function HeroCard({
  rolePrefix = "I build",
  roles,
  availability,
  openTo,
  currentRole,
  location,
  timeZone,
  primaryCta,
  secondaryCta,
  socials,
  email,
}: {
  rolePrefix?: string;
  roles: string[];
  availability?: string;
  openTo: string[];
  currentRole?: { title: string; company: string; since?: string };
  location?: string | null;
  timeZone: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  socials: SocialLink[];
  email?: string | null;
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce || openTo.length < 2) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % openTo.length),
      ROLE_MS,
    );
    return () => clearInterval(id);
  }, [openTo.length, reduce]);

  const links = [
    ...socials.map((s) => ({
      platform: s.platform,
      href: s.url,
      label: s.platform,
    })),
    ...(email
      ? [{ platform: "email", href: `mailto:${email}`, label: email }]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-2xl"
    >
      {/* Dual-color edge (primary → chart-3) and a faint matching glow */}
      <div
        aria-hidden
        className="absolute -inset-3 opacity-25 blur-2xl"
        style={{ background: DUAL }}
      />
      <div
        aria-hidden
        className="absolute -inset-px"
        style={{ clipPath: CUT, background: DUAL }}
      />

      <div
        className="relative overflow-hidden bg-card/90 backdrop-blur-xl"
        style={{ clipPath: CUT }}
      >
        <div className="relative p-6 sm:p-7">
          {/* Status row */}
          {(availability || location) && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              {availability && (
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  {availability}
                </span>
              )}
              <span className="font-mono text-muted-foreground">
                {location && <>{location} · </>}
                <LiveClock timeZone={timeZone} />
              </span>
            </div>
          )}

          {/* I build ... */}
          {roles.length > 0 && (
            <p className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
              {rolePrefix} <CyberWords words={roles} />
            </p>
          )}

          {/* Open to ... roles */}
          {openTo.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
                  Open to roles
                </span>
                <span aria-hidden className="flex gap-1">
                  {openTo.map((role, i) => (
                    <span
                      key={role}
                      className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-4 bg-primary" : "w-1.5 bg-border"}`}
                    />
                  ))}
                </span>
              </div>
              <CircuitRoles words={openTo} index={active} />
            </div>
          )}

          {currentRole && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                Currently {currentRole.title} at{" "}
                <span className="font-medium text-highlight">
                  {currentRole.company}
                </span>
              </p>
              {currentRole.since && (
                <Uptime since={currentRole.since} company={currentRole.company} />
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="relative flex flex-wrap items-center justify-between gap-4 border-t bg-background/30 px-6 py-4 sm:px-7">
          <div className="flex flex-wrap items-center gap-3">
            {primaryCta && (
              <Magnetic strength={0.25}>
                <a
                  href={primaryCta.href}
                  className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_30px_-12px_var(--primary)] transition-shadow hover:shadow-[0_8px_30px_-6px_var(--primary)]"
                >
                  {primaryCta.label}
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </Magnetic>
            )}
            {secondaryCta && (
              <Magnetic strength={0.25}>
                <a
                  href={secondaryCta.href}
                  className="inline-flex rounded-xl border bg-background/50 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary/60"
                >
                  {secondaryCta.label}
                </a>
              </Magnetic>
            )}
          </div>

          {links.length > 0 && (
            <div className="flex items-center gap-1.5">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target={l.platform === "email" ? undefined : "_blank"}
                  rel="noreferrer"
                  aria-label={l.label}
                  title={l.label}
                  className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <SocialIcon platform={l.platform} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
