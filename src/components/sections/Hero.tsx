"use client";

import { motion } from "motion/react";
import type { Section, SiteSettings } from "@/lib/types";

export function Hero({ section, settings }: { section: Section; settings: SiteSettings }) {
  const { ctaLabel, ctaHref } = section.content as { ctaLabel?: string; ctaHref?: string };

  return (
    <section
      id={section.slug}
      className="mx-auto flex min-h-[90vh] w-full max-w-5xl flex-col justify-center px-6"
    >
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="font-mono text-sm text-accent"
      >
        {settings.ownerName || settings.siteName}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-4 text-5xl font-bold tracking-tight sm:text-7xl"
      >
        {section.title}
      </motion.h1>
      {section.subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-xl text-muted"
        >
          {section.subtitle}
        </motion.p>
      )}
      {ctaLabel && ctaHref && (
        <motion.a
          href={ctaHref}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="mt-10 w-fit rounded-full bg-accent px-6 py-3 font-medium text-white"
        >
          {ctaLabel}
        </motion.a>
      )}
    </section>
  );
}
