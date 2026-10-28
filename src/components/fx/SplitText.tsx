"use client";

import { motion } from "motion/react";

/** Letters rise and unfold one after another, then hop and light up when hovered. */
export function SplitText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  let index = 0;

  return (
    <span className={className} aria-label={text}>
      {words.map((word, w) => (
        <span key={w} aria-hidden className="inline-block whitespace-nowrap">
          {[...word].map((char) => {
            const i = index++;
            return (
              <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <motion.span
                  className="inline-block origin-bottom"
                  initial={{ y: "110%", rotateX: -80, opacity: 0 }}
                  animate={{ y: "0%", rotateX: 0, opacity: 1 }}
                  transition={{ delay: delay + i * 0.035, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: "-12%", color: "var(--highlight)", transition: { type: "spring", stiffness: 500, damping: 12 } }}
                >
                  {char}
                </motion.span>
              </span>
            );
          })}
          {w < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}
