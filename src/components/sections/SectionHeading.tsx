"use client";

import { motion } from "motion/react";

/** "01 / Experience" eyebrow plus a title whose words slide up from behind a mask. */
export function SectionHeading({ index, eyebrow, title }: { index: number; eyebrow?: string | null; title: string }) {
  return (
    <div className="mb-14">
      <motion.p
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-4 flex items-center gap-3 font-mono text-sm text-highlight"
      >
        <span>{String(index).padStart(2, "0")}</span>
        <motion.span
          className="h-px w-10 origin-left bg-highlight"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        />
        <span className="uppercase tracking-widest">{eyebrow}</span>
      </motion.p>
      <h2 className="max-w-3xl text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
        {title.split(" ").map((word, i) => (
          <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
            <motion.span
              className="inline-block pr-[0.25em]"
              initial={{ y: "105%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </h2>
    </div>
  );
}
