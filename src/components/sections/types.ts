import type { Section, SiteSettings } from "@/lib/types";

export interface SectionProps {
  section: Section;
  settings: SiteSettings;
  /** 1-based position among non-hero sections, shown as "01", "02", ... */
  index: number;
  /** Every visible section, for cross-references (e.g. where a skill was used). */
  sections: Section[];
}

export const labelFromSlug = (slug: string) =>
  slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export const pad = (n: number) => String(n).padStart(2, "0");

/** File name visitors get when downloading the CV, e.g. "Khan-Atik-Faisal-CV.pdf". */
export const cvFileName = (name: string) => `${name.trim().replace(/\s+/g, "-")}-CV.pdf`;

/** "2025-10-01T00:00:00Z" → "Oct 2025". */
export const fmtMonth = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

/** Inclusive month span, e.g. Mar–Sep → "7 mos", 13 months → "1 yr 1 mo". An open end means `now`. */
export function duration(start: string | number, end: string | number | null, now: number) {
  const a = new Date(start);
  const b = new Date(end ?? now);
  const months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth() + 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y} yr${y > 1 ? "s" : ""}`, m && `${m} mo${m > 1 ? "s" : ""}`].filter(Boolean).join(" ");
}

/** "ACI PLC" → "ACI", "Deep Mind Labs" → "DML". */
export function monogram(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  if (words[0] && words[0].length <= 4 && words[0] === words[0].toUpperCase()) return words[0];
  return words
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}
