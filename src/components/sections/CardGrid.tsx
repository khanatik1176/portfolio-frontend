import type { Section } from "@/lib/types";
import { Reveal } from "../Reveal";
import { SectionShell } from "./SectionShell";

/** Projects, services, testimonials, and custom sections. */
export function CardGrid({ section }: { section: Section }) {
  const body = section.content.body as string | undefined;
  return (
    <SectionShell section={section}>
      {body && <p className="mb-10 max-w-3xl whitespace-pre-line text-muted">{body}</p>}
      <div className="grid gap-6 sm:grid-cols-2">
        {section.items.map((item, i) => (
          <Reveal key={item.id} delay={i * 0.06}>
            <article className="h-full rounded-2xl border border-line p-6 transition hover:-translate-y-1 hover:border-accent">
              {item.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt=""
                  className="mb-4 aspect-video w-full rounded-lg object-cover"
                />
              )}
              <h3 className="text-xl font-semibold">{item.title}</h3>
              {item.subtitle && <p className="mt-1 text-sm text-muted">{item.subtitle}</p>}
              {item.description && <p className="mt-3 text-muted">{item.description}</p>}
              {item.tags.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <li key={tag} className="rounded bg-surface px-2 py-1 font-mono text-xs">
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block text-sm font-medium text-accent"
                >
                  View →
                </a>
              )}
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
