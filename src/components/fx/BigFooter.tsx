"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { SocialLink } from "@/lib/types";

/** Oversized outlined name that fills with the primary color as the footer scrolls into view. */
export function BigFooter({ name, socials }: { name: string; socials: SocialLink[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const clip = useTransform(scrollYProgress, [0.2, 1], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);

  return (
    <footer ref={ref} className="relative overflow-hidden border-t px-4 pt-16 pb-8 sm:px-6">
      <div className="mx-auto flex max-w-[1536px] flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>Designed & built by {name}</p>
        <ul className="flex gap-5">
          {socials.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer" className="capitalize hover:text-highlight">
                {s.platform}
              </a>
            </li>
          ))}
          <li>
            <a href="#" className="hover:text-highlight">Back to top ↑</a>
          </li>
        </ul>
      </div>
      <div aria-hidden className="relative mx-auto mt-10 max-w-[1536px] select-none">
        <p className="text-outline text-center text-[8.4vw] leading-none font-black tracking-tighter whitespace-nowrap uppercase">
          {name}
        </p>
        <motion.p
          style={{ clipPath: clip }}
          className="absolute inset-0 text-center text-[8.4vw] leading-none font-black tracking-tighter whitespace-nowrap text-primary uppercase"
        >
          {name}
        </motion.p>
      </div>
    </footer>
  );
}
