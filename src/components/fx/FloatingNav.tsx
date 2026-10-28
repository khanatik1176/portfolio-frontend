"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

interface NavLink {
  slug: string;
  label: string;
}

/** Floating pill nav; the lime pill glides to whichever section is on screen. */
export function FloatingNav({ initials, links }: { initials: string; links: NavLink[] }) {
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // On narrow screens the list scrolls; keep the active link visible.
  useEffect(() => {
    const link = listRef.current?.querySelector<HTMLElement>(`[href="#${active}"]`);
    const list = listRef.current;
    if (link && list) list.scrollTo({ left: link.offsetLeft - list.clientWidth / 2 + link.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const { slug } of links) {
      const el = document.getElementById(slug);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [links]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-4 z-40 flex justify-center px-4"
    >
      <nav className="flex max-w-full items-center gap-1 rounded-lg border bg-card/70 p-1.5 shadow-lg backdrop-blur-xl">
        <a
          href="#"
          className="grid h-9 shrink-0 place-items-center rounded-lg bg-primary px-3 font-mono text-xs font-bold text-primary-foreground"
        >
          {initials}
        </a>
        <ul ref={listRef} className="flex min-w-0 overflow-x-auto [scrollbar-width:none]">
          {links.map(({ slug, label }) => (
            <li key={slug} className="relative">
              {active === slug && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-lg bg-muted"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <a
                href={`#${slug}`}
                className={`relative block whitespace-nowrap px-3 py-2 text-sm transition-colors ${
                  active === slug ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <ThemeToggle />
      </nav>
    </motion.header>
  );
}
