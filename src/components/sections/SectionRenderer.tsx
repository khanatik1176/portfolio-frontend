import type { Section, SiteSettings } from "@/lib/types";
import { About } from "./About";
import { CardGrid } from "./CardGrid";
import { Contact } from "./Contact";
import { Hero } from "./Hero";
import { Skills } from "./Skills";
import { Timeline } from "./Timeline";

/** Picks the component for a section's type. New types fall back to CardGrid. */
export function SectionRenderer({ section, settings }: { section: Section; settings: SiteSettings }) {
  switch (section.type) {
    case "HERO":
      return <Hero section={section} settings={settings} />;
    case "ABOUT":
      return <About section={section} settings={settings} />;
    case "SKILLS":
      return <Skills section={section} />;
    case "EXPERIENCE":
    case "EDUCATION":
      return <Timeline section={section} />;
    case "CONTACT":
      return <Contact section={section} settings={settings} />;
    default:
      return <CardGrid section={section} />;
  }
}
