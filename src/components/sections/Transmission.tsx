"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { DecryptText } from "../fx/DecryptText";

/** Bio presented as an incoming transmission that decrypts as you scroll. */
export function Transmission({
  text,
  source,
}: {
  text: string;
  source: string;
}) {
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(reduce ? 1 : 0);
  const pct = Math.round(progress * 100);
  const done = pct >= 100;

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 font-mono text-[10px] tracking-[0.2em] uppercase">
        <span className="flex items-center gap-2 font-bold">
          <motion.span
            className="text-highlight"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            ◉
          </motion.span>
          incoming transmission
          <span className="hidden font-normal text-muted-foreground sm:inline">
            · src: {source}
          </span>
        </span>
        <span className="flex items-center gap-3">
          <span aria-hidden className="flex h-3 items-end gap-[2px]">
            {[0.5, 0.9, 0.4, 1, 0.6, 0.8].map((h, i) => (
              <motion.span
                key={i}
                className="w-[2px] origin-bottom bg-chart-2"
                style={{ height: "100%" }}
                animate={
                  reduce
                    ? { scaleY: h }
                    : { scaleY: [0.2, h, 0.35, h * 0.8, 0.2] }
                }
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </span>
          <span
            className={
              done ? "font-bold text-highlight" : "text-muted-foreground"
            }
          >
            {done ? (
              "decrypted ✓"
            ) : (
              <>
                decrypting{" "}
                <span className="text-foreground tabular-nums">{pct}%</span>
              </>
            )}
          </span>
        </span>
      </div>

      {/* Progress */}
      <div className="h-px w-full bg-border">
        <motion.div
          className="h-full origin-left bg-gradient-to-r from-primary to-chart-3 shadow-[0_0_8px_var(--primary)]"
          animate={{ scaleX: progress }}
          transition={{ type: "spring", stiffness: 120, damping: 24 }}
        />
      </div>

      <div className="pt-6">
        <DecryptText
          text={text}
          onProgress={setProgress}
          className="text-2xl leading-snug font-medium tracking-tight sm:text-3xl"
        />
      </div>
    </div>
  );
}
