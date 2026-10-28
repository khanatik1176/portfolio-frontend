import { CircularText } from "../fx/CircularText";
import { CountUp } from "../fx/CountUp";
import { Reveal } from "../fx/Reveal";
import { ScrollRevealText } from "../fx/ScrollRevealText";
import { SectionFrame } from "./SectionFrame";
import type { SectionProps } from "./types";

interface AboutContent {
  body?: string;
  stats?: { value: number; suffix?: string; label: string; decimals?: number }[];
  traits?: string[];
  interests?: string[];
}

export function About({ section, settings, index }: SectionProps) {
  const c = section.content as AboutContent;
  return (
    <SectionFrame
      section={section}
      index={index}
      decor={
        <>
          <div className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_80%_30%,black,transparent_60%)]" />
          <div className="absolute top-24 right-6 hidden text-highlight md:block lg:right-16">
            <CircularText text={`about me • ${settings.headline} • `} size={170}>
              <span className="text-3xl">✦</span>
            </CircularText>
          </div>
        </>
      }
    >
      <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <ScrollRevealText
            text={c.body ?? settings.bio}
            className="text-2xl leading-snug font-medium tracking-tight sm:text-3xl"
          />
          {(c.traits?.length || c.interests?.length) && (
            <Reveal className="mt-12 grid gap-6 sm:grid-cols-2">
              {c.traits && <ChipGroup label="How I work" items={c.traits} />}
              {c.interests && <ChipGroup label="Curious about" items={c.interests} />}
            </Reveal>
          )}
        </div>
        <div className="grid grid-cols-2 content-start gap-4">
          {c.stats?.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <div className="group h-full rounded-lg border bg-card/60 p-6 backdrop-blur transition-colors hover:border-primary/60">
                <p className="text-4xl font-extrabold tracking-tighter text-highlight sm:text-5xl">
                  <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionFrame>
  );
}

function ChipGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="mb-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">{label}</p>
      <ul className="flex flex-wrap gap-2">
        {items.map((t) => (
          <li key={t} className="rounded-lg border px-3 py-1 text-sm transition-colors hover:border-primary hover:text-highlight">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
