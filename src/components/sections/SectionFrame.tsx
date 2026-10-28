import { clsx } from "clsx";
import type { ReactNode } from "react";
import { SectionHeading } from "./SectionHeading";
import { labelFromSlug, type SectionProps } from "./types";

const SURFACES = {
  page: "",
  sage: "surface-sage mx-2 rounded-[2.5rem] sm:mx-4",
  mist: "surface-mist mx-2 rounded-[2.5rem] sm:mx-4",
  ink: "surface-ink mx-2 rounded-[2.5rem] sm:mx-4",
};

/**
 * Full-width section with its own surface and decoration layer.
 * Uses overflow-clip (not hidden) so sticky children keep working.
 */
export function SectionFrame({
  section,
  index,
  children,
  surface = "page",
  decor,
  header = true,
  className,
}: Omit<SectionProps, "settings"> & {
  children: ReactNode;
  surface?: keyof typeof SURFACES;
  decor?: ReactNode;
  header?: boolean;
  className?: string;
}) {
  return (
    <section id={section.slug} className={clsx("relative scroll-mt-24 overflow-clip", SURFACES[surface], className)}>
      {decor && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {decor}
        </div>
      )}
      <div className="relative mx-auto w-full max-w-[1536px] px-4 py-24 sm:px-6 md:py-32 lg:px-8">
        {header && <SectionIntro section={section} index={index} />}
        {children}
      </div>
    </section>
  );
}

export function SectionIntro({ section, index }: Omit<SectionProps, "settings">) {
  return (
    <>
      <SectionHeading index={index} eyebrow={labelFromSlug(section.slug)} title={section.title} />
      {section.subtitle && <p className="-mt-8 mb-14 max-w-2xl text-lg text-muted-foreground">{section.subtitle}</p>}
    </>
  );
}
