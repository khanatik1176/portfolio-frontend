import type { Section } from "@/lib/types";
import { Reveal } from "../Reveal";
import { SectionShell } from "./SectionShell";

export function Skills({ section }: { section: Section }) {
  return (
    <SectionShell section={section}>
      <ul className="flex flex-wrap gap-3">
        {section.items.map((item, i) => (
          <li key={item.id}>
            <Reveal delay={i * 0.04}>
              <span className="inline-block rounded-full border border-line px-4 py-2 text-sm">
                {item.title}
              </span>
            </Reveal>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
