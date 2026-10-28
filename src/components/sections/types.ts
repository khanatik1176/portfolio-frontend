import type { Section, SiteSettings } from "@/lib/types";

export interface SectionProps {
  section: Section;
  settings: SiteSettings;
  /** 1-based position among non-hero sections, shown as "01", "02", ... */
  index: number;
}

export const labelFromSlug = (slug: string) =>
  slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
