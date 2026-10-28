"use client";

import { motion } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ScrambleText } from "../fx/ScrambleText";

const COMMAND = "whoami";

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 60_000);
  return () => clearInterval(id);
};

function tenure(since: string) {
  const start = new Date(since);
  const now = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
  if (months < 1) return "just started";
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y}y`, m && `${m}m`].filter(Boolean).join(" ");
}

/**
 * Terminal-style status line: types `whoami`, then decodes the current role
 * and company, with a live tenure counter.
 */
export function CurrentRole({ title, company, since }: { title: string; company: string; since?: string }) {
  const [typed, setTyped] = useState(0);
  const time = useSyncExternalStore(subscribe, () => (since ? tenure(since) : ""), () => "");
  const startLabel = since
    ? new Date(since).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })
    : null;

  useEffect(() => {
    if (typed >= COMMAND.length) return;
    const id = setTimeout(() => setTyped((n) => n + 1), typed === 0 ? 500 : 90);
    return () => clearTimeout(id);
  }, [typed]);

  const done = typed >= COMMAND.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 inline-block max-w-full overflow-hidden rounded-xl border bg-card/60 font-mono text-sm shadow-lg backdrop-blur"
    >
      <div className="flex items-center gap-1.5 border-b px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-destructive/70" />
        <span className="h-2 w-2 rounded-full bg-chart-5/70" />
        <span className="h-2 w-2 rounded-full bg-primary/70" />
        <span className="ml-2 text-[10px] text-muted-foreground">~/career</span>
      </div>
      <div className="space-y-1 px-4 py-3">
        <p className="text-muted-foreground">
          <span className="text-highlight">❯</span> {COMMAND.slice(0, typed)}
          {!done && <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-primary" />}
        </p>
        {done && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="font-sans text-base font-semibold">
              <ScrambleText text={title} duration={900} />
            </span>
            <span className="text-muted-foreground">@</span>
            <span className="relative font-sans text-base font-bold text-highlight">
              <ScrambleText text={company} delay={300} duration={700} />
              <motion.span
                className="absolute -bottom-0.5 left-0 h-0.5 w-full origin-left bg-primary"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.1, duration: 0.6 }}
              />
            </span>
            {startLabel && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                since {startLabel}
                {time && ` · ${time}`}
              </span>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
