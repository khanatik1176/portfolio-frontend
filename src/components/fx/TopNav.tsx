"use client";

import { Download, Menu, Search } from "lucide-react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { openPalette } from "./CommandPalette";
import { LogoMark } from "./Logo";

interface NavLink {
  slug: string;
  label: string;
}

/** Which section is currently in the reading zone. */
function useActiveSection(links: NavLink[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const { slug } of links) {
      const el = document.getElementById(slug);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [links]);
  return active;
}

/**
 * Floating top bar: monogram, section links with a gliding highlight, the
 * command menu and a contact shortcut. Gains a surface once the page scrolls.
 */
export function TopNav({ name, links, cv }: { name: string; links: NavLink[]; cv?: { url: string; fileName: string } | null }) {
  const active = useActiveSection(links);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));
  // The contact section has its own button on the right.
  const shown = links.filter((l) => l.slug !== "contact");

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-2 pt-3 lg:px-6">
      <nav
        className={`mx-auto flex h-14 max-w-[110rem] items-center gap-2 rounded-2xl border px-2 transition-[background-color,border-color,box-shadow] duration-300 ${
          scrolled ? "border-border bg-background/75 shadow-lg backdrop-blur-xl" : "border-transparent bg-transparent"
        }`}
      >
        <a href="#" className="flex items-center gap-2.5 rounded-xl px-2 py-1.5">
          <LogoMark className="h-10 w-10 shrink-0" />
          <span className="hidden font-display text-sm font-bold tracking-tight sm:block">{name}</span>
        </a>

        <ul className="mx-auto hidden items-center xl:flex">
          {shown.map(({ slug, label }) => (
            <li key={slug} className="relative">
              {active === slug && (
                <motion.span layoutId="nav-active" className="absolute inset-0 rounded-lg bg-secondary/30" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
              )}
              <a
                href={`#${slug}`}
                className={`relative block px-3 py-1.5 text-sm transition-colors ${active === slug ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1.5 xl:ml-0">
          <button
            type="button"
            onClick={openPalette}
            className="hidden h-9 items-center gap-2 rounded-lg border bg-background/60 px-3 text-xs text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <Search className="h-3.5 w-3.5" aria-hidden />
            Search
            <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">⌘K</kbd>
          </button>
          <button
            type="button"
            onClick={openPalette}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-md border text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          {cv && (
            <a
              href={cv.url}
              download={cv.fileName}
              aria-label="Download CV"
              className="flex h-9 items-center gap-1.5 rounded-lg border border-primary/40 px-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 sm:px-3"
            >
              <Download className="h-4 w-4" aria-hidden />
              <span className="hidden md:inline">CV</span>
            </a>
          )}
          <a
            href="#contact"
            className="hidden h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_-6px_var(--primary)] transition-shadow hover:shadow-[0_0_32px_-4px_var(--primary)] sm:flex"
          >
            Let&apos;s talk
          </a>
        </div>
      </nav>
    </header>
  );
}
