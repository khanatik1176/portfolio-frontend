"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}—=+*^?#01ABCDEFX";

/** Resolves text left-to-right out of random glyphs, like a decoder. */
export function ScrambleText({ text, delay = 0, duration = 1200 }: { text: string; delay?: number; duration?: number }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (reduce) return;
    let frame = 0;
    let interval: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      const frames = Math.round(duration / 40);
      interval = setInterval(() => {
        frame++;
        const solved = Math.floor((frame / frames) * text.length);
        setDisplay(
          [...text]
            .map((ch, i) => (i < solved || ch === " " ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
            .join(""),
        );
        if (frame >= frames) {
          clearInterval(interval);
          setDisplay(text);
        }
      }, 40);
    }, delay);
    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [text, delay, duration, reduce]);

  return (
    <span aria-label={text}>
      <span aria-hidden>{display}</span>
    </span>
  );
}
