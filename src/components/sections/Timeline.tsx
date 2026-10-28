import type { Section, SectionItem } from "@/lib/types";
import { Reveal } from "../Reveal";
import { SectionShell } from "./SectionShell";

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

function period(item: SectionItem) {
  if (!item.startDate) return null;
  return `${fmt(item.startDate)} — ${item.endDate ? fmt(item.endDate) : "Present"}`;
}

/** Experience and education. */
export function Timeline({ section }: { section: Section }) {
  return (
    <SectionShell section={section}>
      <ol className="space-y-10 border-l border-line pl-8">
        {section.items.map((item, i) => (
          <li key={item.id} className="relative">
            <span className="absolute -left-[37px] top-2 h-2.5 w-2.5 rounded-full bg-accent" />
            <Reveal delay={i * 0.06}>
              <p className="font-mono text-xs text-muted">{period(item)}</p>
              <h3 className="mt-1 text-xl font-semibold">{item.title}</h3>
              {item.subtitle && <p className="text-accent">{item.subtitle}</p>}
              {item.description && (
                <p className="mt-2 whitespace-pre-line text-muted">{item.description}</p>
              )}
            </Reveal>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
