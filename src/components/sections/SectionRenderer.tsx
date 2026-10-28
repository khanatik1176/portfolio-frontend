import type { Section, SiteSettings } from "@/lib/types";
import { About } from "./About";
import { Contact } from "./Contact";
import { Education } from "./Education";
import { Hero } from "./Hero";
import { Projects } from "./Projects";
import { Skills } from "./Skills";
import { Spotlight } from "./Spotlight";
import { Timeline } from "./Timeline";

/** Picks the component for a section's type. Remaining types fall back to the project layout. */
export function SectionRenderer({ section, settings, index }: { section: Section; settings: SiteSettings; index: number }) {
  const props = { section, settings, index };
  switch (section.type) {
    case "HERO":
      return <Hero section={section} settings={settings} />;
    case "ABOUT":
      return <About {...props} />;
    case "SKILLS":
      return <Skills {...props} />;
    case "EXPERIENCE":
      return <Timeline {...props} />;
    case "EDUCATION":
      return <Education {...props} />;
    case "CONTACT":
      return <Contact {...props} />;
    case "CUSTOM":
    case "TESTIMONIALS":
      return <Spotlight {...props} />;
    default:
      return <Projects {...props} />;
  }
}
