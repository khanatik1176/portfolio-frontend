import type { Metadata } from "next";
import { Suspense } from "react";
import { CommandPalette } from "@/components/fx/CommandPalette";
import { MotionProvider } from "@/components/fx/MotionProvider";
import { ScrollProgress } from "@/components/fx/ScrollProgress";
import { SiteFooter } from "@/components/fx/SiteFooter";
import { TopNav } from "@/components/fx/TopNav";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { cvFileName, labelFromSlug } from "@/components/sections/types";
import { getPortfolio } from "@/lib/portfolio";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolio();
  if (!data) return {};
  const { settings } = data;
  const seo = settings.seo as { title?: string; description?: string };
  return {
    title: seo.title || settings.siteName,
    description: seo.description || settings.headline,
  };
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Portfolio />
    </Suspense>
  );
}

async function Portfolio() {
  const data = await getPortfolio();

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center text-muted-foreground">
        Portfolio content is unavailable right now. Please check back soon.
      </main>
    );
  }

  const { settings, sections } = data;
  const name = settings.ownerName || settings.siteName;
  const navLinks = sections
    .filter((s) => s.type !== "HERO")
    .map((s) => ({ slug: s.slug, label: labelFromSlug(s.slug) }));
  const papers = sections
    .filter((s) => s.content.layout === "publications")
    .flatMap((s) => s.items.filter((i) => i.link).map((i) => ({ title: i.title, url: i.link! })));

  const heroContent = (sections.find((s) => s.type === "HERO")?.content ?? {}) as { badge?: string; availability?: string; timeZone?: string };
  const cv = settings.resumeUrl ? { url: settings.resumeUrl, fileName: cvFileName(name) } : null;

  let index = 0;
  return (
    <MotionProvider>
      <CommandPalette
        data={{ sections: navLinks, email: settings.email, resumeUrl: settings.resumeUrl, cvFileName: cv?.fileName, socials: settings.socials, papers }}
      />
      <ScrollProgress />
      <TopNav name={name} links={navLinks} cv={cv} />
      {/* Clips full-bleed bands (tapes, tickers, the project gallery) without breaking sticky positioning. */}
      <div className="overflow-x-clip">
        <main className="mx-auto max-w-[110rem] px-4 lg:px-8">
          {sections.map((section) => (
            <SectionRenderer
              key={section.id}
              section={section}
              settings={settings}
              sections={sections}
              index={section.type === "HERO" ? 0 : ++index}
            />
          ))}
        </main>
        <SiteFooter
          name={name}
          headline={heroContent.badge ?? settings.headline}
          availability={heroContent.availability ?? null}
          location={settings.location}
          timeZone={heroContent.timeZone ?? null}
          email={settings.email}
          socials={settings.socials}
          links={navLinks}
        />
      </div>
    </MotionProvider>
  );
}
