import { CountUp } from "../fx/CountUp";
import { Reveal } from "../fx/Reveal";
import { ScrollHighlight } from "../fx/ScrollHighlight";
import { SectionFrame } from "./SectionFrame";
import type { SectionProps } from "./types";

interface AboutContent {
  body?: string;
  stats?: { label: string; value: number; suffix?: string; decimals?: number }[];
}

/** Bio that lights up as you scroll, then glowing number tiles. */
export function About({ section, index }: SectionProps) {
  const c = section.content as AboutContent;
  return (
    <SectionFrame section={section} index={index}>
      {c.body && (
        <ScrollHighlight
          text={c.body}
          className="max-w-5xl font-display text-2xl leading-snug font-semibold tracking-tight md:text-4xl md:leading-[1.2]"
        />
      )}

      {c.stats && c.stats.length > 0 && (
        <dl className="mt-16 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {c.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="h-full">
              <div className="group relative flex h-full flex-col-reverse overflow-hidden rounded-3xl border bg-card p-4 transition-colors hover:border-primary/50 sm:p-6">
                <span
                  aria-hidden
                  className={`absolute -top-12 -right-12 h-32 w-32 rounded-full blur-2xl transition-opacity duration-500 group-hover:opacity-100 ${
                    i % 2 ? "bg-primary/25 opacity-50" : "bg-secondary/40 opacity-60"
                  }`}
                />
                <dt className="relative mt-2 text-sm leading-snug text-muted-foreground">{s.label}</dt>
                <dd className="text-joker relative font-display text-[2.1rem] leading-none font-extrabold tracking-tight tabular-nums sm:text-5xl md:text-6xl">
                  <CountUp value={s.value} decimals={s.decimals ?? 0} suffix={s.suffix ?? ""} />
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      )}

    </SectionFrame>
  );
}
