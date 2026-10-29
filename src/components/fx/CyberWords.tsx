"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;
const GLYPHS = "!<>-_\\/[]{}=+*^?#01ABCDEFXZ";

/** Resolves `text` left-to-right out of random glyphs whenever it changes. */
function useDecode(text: string, duration: number, enabled: boolean) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!enabled) return;
    const frames = Math.max(1, Math.round(duration / 40));
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      const solved = Math.floor((frame / frames) * text.length);
      setDisplay(
        [...text]
          .map((ch, i) => (i < solved || ch === " " ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(""),
      );
      if (frame >= frames) {
        clearInterval(id);
        setDisplay(text);
      }
    }, 40);
    return () => clearInterval(id);
  }, [text, duration, enabled]);

  return enabled ? display : text;
}

/**
 * Cyberpunk word cycler: each phrase slices in with a skew, decodes out of
 * random glyphs, jitters with an RGB-split glow, gets a neon underline sweep,
 * and is followed by a blinking block cursor.
 */
export function CyberWords({ words, interval = 2800 }: { words: string[]; interval?: number }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (words.length < 2 || reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval, reduce]);

  const word = words[i] ?? "";
  const display = useDecode(word, 550, !reduce);

  return (
    <span className="relative inline-flex items-baseline gap-1 align-bottom">
      <span className="relative inline-grid">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={word}
            aria-label={word}
            className="col-start-1 row-start-1 text-highlight sm:whitespace-nowrap"
            style={{ textShadow: "2px 0 var(--chart-3), -2px 0 var(--chart-2)" }}
            initial={{ clipPath: "inset(0 100% 0 0)", skewX: -14, opacity: 0.4 }}
            animate={{ clipPath: "inset(0 0% 0 0)", skewX: 0, opacity: 1, x: [0, -3, 2, -1, 0] }}
            exit={{ clipPath: "inset(0 0 0 100%)", skewX: 14, opacity: 0 }}
            transition={{
              clipPath: { duration: 0.35, ease: EASE },
              skewX: { duration: 0.35, ease: EASE },
              opacity: { duration: 0.2 },
              x: { duration: 0.3, delay: 0.35 },
            }}
          >
            <span aria-hidden>{display}</span>
          </motion.span>
        </AnimatePresence>

        {/* Neon underline sweep, restarted for every phrase */}
        <motion.span
          key={`line-${word}`}
          aria-hidden
          className="absolute -bottom-1 left-0 h-[3px] w-full origin-left bg-gradient-to-r from-primary via-chart-3 to-chart-2 shadow-[0_0_10px_var(--primary)]"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0.35] }}
          transition={{ duration: 1.2, times: [0, 0.4, 1], ease: EASE }}
        />
      </span>

      {/* Block cursor */}
      <motion.span
        aria-hidden
        className="inline-block h-[0.85em] w-[0.45em] translate-y-[0.1em] bg-primary shadow-[0_0_10px_var(--primary)]"
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
      />
    </span>
  );
}
