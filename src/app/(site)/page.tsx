import type { Metadata } from "next";
import { Suspense } from "react";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
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
      <main className="flex min-h-screen items-center justify-center px-6 text-center text-muted">
        Portfolio content is unavailable right now. Please check back soon.
      </main>
    );
  }

  const { settings, sections } = data;
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-line bg-background/80 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="#" className="font-semibold">
            {settings.siteName}
          </a>
          <ul className="hidden gap-6 text-sm text-muted sm:flex">
            {sections
              .filter((s) => s.type !== "HERO")
              .map((s) => (
                <li key={s.id}>
                  <a href={`#${s.slug}`} className="hover:text-foreground">
                    {s.title}
                  </a>
                </li>
              ))}
          </ul>
        </nav>
      </header>
      <main>
        {sections.map((section) => (
          <SectionRenderer key={section.id} section={section} settings={settings} />
        ))}
      </main>
      <footer className="border-t border-line py-10 text-center text-sm text-muted">
        <ul className="mb-4 flex justify-center gap-4">
          {settings.socials.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer" className="capitalize hover:text-foreground">
                {s.platform}
              </a>
            </li>
          ))}
        </ul>
        © {settings.ownerName || settings.siteName}
      </footer>
    </>
  );
}
