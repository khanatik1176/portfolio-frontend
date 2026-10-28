import type { ReactNode } from "react";
import type { Section } from "@/lib/types";
import { Reveal } from "../Reveal";

export function SectionShell({
  section,
  children,
}: {
  section: Section;
  children: ReactNode;
}) {
  return (
    <section id={section.slug} className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 py-24">
      <Reveal>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{section.title}</h2>
        {section.subtitle && (
          <p className="mt-3 max-w-2xl text-lg text-muted">{section.subtitle}</p>
        )}
      </Reveal>
      <div className="mt-12">{children}</div>
    </section>
  );
}
