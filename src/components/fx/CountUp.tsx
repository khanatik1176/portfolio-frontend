"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/** Counts from 0 to `value` the first time it scrolls into view. */
export function CountUp({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce) {
      el.textContent = value.toFixed(decimals) + suffix;
      return;
    }
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = v.toFixed(decimals) + suffix),
    });
    return () => controls.stop();
  }, [inView, value, decimals, suffix, reduce]);

  return <span ref={ref}>{(0).toFixed(decimals) + suffix}</span>;
}
