import { clsx } from "clsx";
import type { ReactNode } from "react";
import { CardIndex } from "../fx/CardIndex";
import { KineticTitle } from "../fx/KineticTitle";
import { Reveal } from "../fx/Reveal";
import { labelFromSlug, pad, type SectionProps } from "./types";

/** A flipping card index, eyebrow and kinetic title, with the subtitle alongside. */
export function SectionHeader({ section, index, className }: Pick<SectionProps, "section" | "index"> & { className?: string }) {
  return (
    <header className={clsx("relative mb-12 grid gap-6 md:mb-16 md:grid-cols-[1fr_auto] md:items-end", className)}>
      <div className="relative flex items-end gap-5 md:gap-7">
        <CardIndex value={pad(index)} className="mb-2 hidden sm:block" />
        <div>
          <Reveal>
            <p className="mb-5 flex items-center gap-3 font-mono text-xs text-muted-foreground">
              <span className="h-px w-8 bg-primary" />
              <span className="tracking-[0.25em] text-primary uppercase">{labelFromSlug(section.slug)}</span>
            </p>
          </Reveal>
          <h2 className="max-w-3xl font-display text-4xl leading-[1.02] font-bold tracking-tight md:text-6xl lg:text-7xl">
            <KineticTitle text={section.title} />
          </h2>
        </div>
      </div>
      {section.subtitle && (
        <Reveal delay={0.2} className="relative">
          <p className="max-w-sm text-muted-foreground md:text-right">{section.subtitle}</p>
        </Reveal>
      )}
    </header>
  );
}

/** A content section: header, then its body. */
export function SectionFrame({
  section,
  index,
  children,
  className,
}: Pick<SectionProps, "section" | "index"> & { children: ReactNode; className?: string }) {
  return (
    <section id={section.slug} className={clsx("relative scroll-mt-20 py-24 md:py-32", className)}>
      <SectionHeader section={section} index={index} />
      {children}
    </section>
  );
}
