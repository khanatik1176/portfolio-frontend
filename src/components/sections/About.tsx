import type { Section, SiteSettings } from "@/lib/types";
import { Reveal } from "../Reveal";
import { SectionShell } from "./SectionShell";

export function About({ section, settings }: { section: Section; settings: SiteSettings }) {
  const body = (section.content.body as string | undefined) ?? settings.bio;
  return (
    <SectionShell section={section}>
      <Reveal>
        <p className="max-w-3xl whitespace-pre-line text-lg leading-relaxed text-muted">{body}</p>
      </Reveal>
    </SectionShell>
  );
}
