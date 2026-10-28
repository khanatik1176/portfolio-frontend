import type { Metadata } from "next";
import { Suspense } from "react";
import { BigFooter } from "@/components/fx/BigFooter";
import { FloatingNav } from "@/components/fx/FloatingNav";
import { MotionProvider } from "@/components/fx/MotionProvider";
import { ScrollProgress } from "@/components/fx/ScrollProgress";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import { labelFromSlug } from "@/components/sections/types";
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
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
  const navLinks = sections
    .filter((s) => s.type !== "HERO")
    .map((s) => ({ slug: s.slug, label: labelFromSlug(s.slug) }));

  let index = 0;
  return (
    <MotionProvider>
      <ScrollProgress />
      <FloatingNav initials={initials} links={navLinks} />
      <main className="overflow-x-clip">
        {sections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            settings={settings}
            index={section.type === "HERO" ? 0 : ++index}
          />
        ))}
      </main>
      <BigFooter name={name} socials={settings.socials} />
    </MotionProvider>
  );
}
