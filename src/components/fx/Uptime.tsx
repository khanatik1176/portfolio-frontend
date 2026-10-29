"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSyncExternalStore } from "react";

const DAY = 86_400_000;

const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
};

/** Elapsed time since `since`, as a stable string so useSyncExternalStore can compare snapshots. */
function snapshot(since: string) {
  const start = new Date(since);
  const now = new Date();
  const ms = Math.max(0, now.getTime() - start.getTime());
  let months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
  if (now.getDate() < start.getDate()) months--;
  const days = Math.floor(ms / DAY);
  const rest = Math.floor((ms % DAY) / 1000);
  const hms = [Math.floor(rest / 3600), Math.floor((rest % 3600) / 60), rest % 60].map((n) => String(n).padStart(2, "0")).join(":");
  return `${Math.max(0, months)}|${days}|${hms}`;
}

/** Digits that roll vertically when they change, like an odometer. */
function Rolling({ value }: { value: string }) {
  return (
    <span className="inline-flex tabular-nums">
      {value.split("").map((ch, i) => (
        <span key={i} className="relative inline-block overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={ch}
              className="inline-block"
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {ch}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

/**
 * "Server uptime" readout for time in a role: live day count with a ticking
 * hh:mm:ss, a 12-segment bar for progress through the current year, a year
 * badge, and a plain "1 yr · since Oct 2025" summary.
 */
export function Uptime({ since, company }: { since: string; company: string }) {
  const snap = useSyncExternalStore(subscribe, () => snapshot(since), () => "");
  const [monthsStr, days, hms] = snap ? snap.split("|") : ["", "", ""];
  const months = Number(monthsStr || 0);
  const years = Math.floor(months / 12);
  const monthInYear = months % 12;

  const sinceLabel = new Date(since).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
  const summary = snap
    ? [years && `${years} yr${years > 1 ? "s" : ""}`, monthInYear && `${monthInYear} mo${monthInYear > 1 ? "s" : ""}`].filter(Boolean).join(" ") || "< 1 mo"
    : "";

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px]">
      <span className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <span className="tracking-[0.2em] text-muted-foreground uppercase">uptime @ {company}</span>
      </span>

      <span className="flex items-baseline gap-1.5 text-foreground">
        <span className="text-base font-bold text-highlight">{days ? <Rolling value={days} /> : "—"}</span>
        <span className="text-muted-foreground">d</span>
        <span className="font-semibold">{hms ? <Rolling value={hms} /> : "--:--:--"}</span>
      </span>

      <span className="flex items-center gap-2" title={`Year ${years + 1}: month ${monthInYear + 1} of 12`}>
        <span className="rounded-sm bg-primary px-1 text-[9px] font-bold text-primary-foreground">Y{years + 1}</span>
        <span aria-hidden className="flex gap-[2px]">
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              className={`h-2.5 w-1.5 rounded-[1px] ${
                i < monthInYear ? "bg-primary/80" : i === monthInYear ? "animate-pulse bg-primary shadow-[0_0_6px_var(--primary)]" : "bg-border"
              }`}
            />
          ))}
        </span>
      </span>

      <span className="text-muted-foreground">
        {summary && <span className="text-foreground">{summary}</span>} · since {sinceLabel}
      </span>
    </div>
  );
}
