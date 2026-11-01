"use client";

import { motion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Heading whose words slide up from behind a mask in sequence. The last word is
 * set in italic serif with the accent color (the site's signature).
 */
export function KineticTitle({ text, accentClass = "text-primary" }: { text: string; accentClass?: string }) {
  const words = text.trim().split(/\s+/);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => {
          const last = i === words.length - 1;
          return (
            <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
              <motion.span
                className={`inline-block pr-[0.22em] ${last ? `font-serif font-normal tracking-normal italic ${accentClass}` : ""}`}
                initial={{ y: "110%", rotate: 4 }}
                whileInView={{ y: "0%", rotate: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: i * 0.07, ease: EASE }}
              >
                {w}
              </motion.span>
            </span>
          );
        })}
      </span>
    </>
  );
}
