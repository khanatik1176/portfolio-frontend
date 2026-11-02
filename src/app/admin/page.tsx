"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  ArrowRight,
  Check,
  ExternalLink,
  Eye,
  Inbox,
  LayoutList,
  Rows3,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { clsx } from "clsx";
import { SECTION_META, timeAgo } from "@/components/admin/meta";
import {
  Badge,
  buttonClass,
  Card,
  CardHeader,
  EmptyState,
  ErrorText,
  Skeleton,
} from "@/components/admin/ui";
import { CountUp } from "@/components/fx/CountUp";
import { api } from "@/lib/api";
import type { ContactMessage, Section, SiteSettings } from "@/lib/types";

interface Data {
  sections: Section[];
  messages: ContactMessage[];
  settings: SiteSettings;
}

const EASE = [0.22, 1, 0.36, 1] as const;

// Cards rise in one after another; lists inside stagger their rows.
const page: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};
const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.25 } },
};
const row: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
};

export default function OverviewPage() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api<Section[]>("/sections/admin"),
      api<ContactMessage[]>("/messages"),
      api<SiteSettings>("/settings"),
    ]).then(
      ([sections, messages, settings]) =>
        setData({ sections, messages, settings }),
      (e) => setError(e.message),
    );
  }, []);

  if (!data) {
    return error ? (
      <ErrorText error={error} />
    ) : (
      <div className="grid gap-5">
        <Skeleton className="h-44" />
        <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const { sections, messages, settings } = data;
  const visible = sections.filter((s) => s.isVisible).length;
  const items = sections.reduce((n, s) => n + (s._count?.items ?? 0), 0);
  const unread = messages.filter((m) => !m.isRead).length;

  const checklist = [
    {
      done: !!settings.avatarUrl,
      label: "Avatar photo",
      href: "/admin/settings",
    },
    {
      done: !!settings.resumeUrl,
      label: "Resume link",
      href: "/admin/settings",
    },
    {
      done: settings.socials.length > 0,
      label: "Social links",
      href: "/admin/settings",
    },
    {
      done: !!(settings.seo as { description?: string }).description,
      label: "SEO description",
      href: "/admin/settings",
    },
    {
      done: sections.some((s) => s.type === "HERO" && s.isVisible),
      label: "Hero section",
      href: "/admin/sections",
    },
  ];

  const mix = sections
    .filter((s) => (s._count?.items ?? 0) > 0)
    .map((s) => ({
      id: s.id,
      title: s.title,
      type: s.type,
      count: s._count?.items ?? 0,
    }))
    .sort((a, b) => b.count - a.count);
  const mixMax = Math.max(1, ...mix.map((m) => m.count));

  return (
    <motion.div
      variants={page}
      initial="hidden"
      animate="show"
      className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-12"
    >
      <motion.div variants={rise} className="xl:col-span-12">
        <Welcome settings={settings} checklist={checklist} />
      </motion.div>

      <div className="grid grid-cols-2 gap-5 xl:col-span-12 xl:grid-cols-4">
        <Stat
          icon={LayoutList}
          label="Sections"
          value={sections.length}
          note={`${visible} live · ${sections.length - visible} hidden`}
          href="/admin/sections"
          tone="var(--secondary)"
        />
        <Stat
          icon={Eye}
          label="Live on site"
          value={visible}
          part={visible}
          whole={sections.length}
          note="Shown on the public page"
          href="/admin/sections"
          tone="var(--chart-3)"
        />
        <Stat
          icon={Rows3}
          label="Entries"
          value={items}
          note="Jobs, projects, skills and more"
          href="/admin/sections"
          tone="var(--primary)"
        />
        <Stat
          icon={Inbox}
          label="Unread messages"
          value={unread}
          part={unread}
          whole={messages.length}
          note={`${messages.length} received in total`}
          href="/admin/messages"
          tone="var(--chart-5)"
          pulse={unread > 0}
        />
      </div>

      {/* Page outline */}
      <motion.div variants={rise} className="xl:col-span-7">
        <Card className="h-full">
          <CardHeader
            title="Page outline"
            description="Sections in the order visitors see them."
          >
            <Link
              href="/admin/sections"
              className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Manage{" "}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </CardHeader>
          {sections.length === 0 ? (
            <EmptyState
              icon={<LayoutList />}
              title="No sections yet"
              description="Create a section to start building your page."
            />
          ) : (
            <motion.ol variants={list} className="relative py-2">
              {/* Spine through the section icons, drawn top to bottom */}
              <motion.span
                aria-hidden
                className="absolute top-6 bottom-6 left-[4.1rem] w-px origin-top bg-[linear-gradient(var(--secondary),var(--primary))] opacity-40"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: EASE }}
              />
              {sections.map((s, i) => {
                const Icon = SECTION_META[s.type].icon;
                return (
                  <motion.li key={s.id} variants={row}>
                    <Link
                      href="/admin/sections"
                      className="group flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-muted/40"
                    >
                      <span className="w-5 font-mono text-xs text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="relative grid size-7 shrink-0 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors group-hover:border-primary/50 group-hover:text-primary">
                        <Icon className="size-3.5" />
                      </span>
                      <span
                        className={clsx(
                          "min-w-0 flex-1 truncate text-sm",
                          !s.isVisible && "text-muted-foreground line-through",
                        )}
                      >
                        {s.title}
                      </span>
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {SECTION_META[s.type].label}
                      </span>
                      <span className="hidden w-16 text-right text-xs text-muted-foreground tabular-nums md:inline">
                        {s._count?.items ?? 0}{" "}
                        {s._count?.items === 1 ? "entry" : "entries"}
                      </span>
                      {s.isVisible ? (
                        <Badge tone="success">Live</Badge>
                      ) : (
                        <Badge>Hidden</Badge>
                      )}
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ol>
          )}
        </Card>
      </motion.div>

      {/* Right column */}
      <div className="grid content-start gap-5 xl:col-span-5">
        <motion.div variants={rise}>
          <Card>
            <CardHeader
              title="Recent messages"
              description={
                unread
                  ? `${unread} waiting for a reply`
                  : "You're all caught up"
              }
            >
              <Link
                href="/admin/messages"
                className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                Inbox{" "}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </CardHeader>
            {messages.length === 0 ? (
              <EmptyState
                icon={<Inbox />}
                title="No messages yet"
                description="Messages from your contact form land here."
              />
            ) : (
              <motion.ul variants={list} className="divide-y divide-border">
                {messages.slice(0, 4).map((m) => (
                  <motion.li key={m.id} variants={row}>
                    <Link
                      href="/admin/messages"
                      className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
                    >
                      <span className="relative grid size-8 shrink-0 place-items-center rounded-full bg-secondary/30 text-xs font-semibold text-accent-foreground">
                        {m.name.slice(0, 1).toUpperCase()}
                        {!m.isRead && (
                          <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-primary">
                            <span className="absolute inset-0 animate-ping rounded-full bg-primary motion-reduce:animate-none" />
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span
                            className={clsx(
                              "truncate text-sm",
                              !m.isRead && "font-semibold",
                            )}
                          >
                            {m.name}
                          </span>
                          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                            {timeAgo(m.createdAt)}
                          </span>
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {m.subject || m.message}
                        </span>
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </Card>
        </motion.div>

        <motion.div variants={rise}>
          <Card>
            <CardHeader
              title="Content mix"
              description="Entries in each section."
            />
            {mix.length === 0 ? (
              <EmptyState
                icon={<Rows3 />}
                title="No entries yet"
                description="Jobs, projects and skills you add show up here."
              />
            ) : (
              <ul className="grid gap-3 px-5 py-4">
                {mix.map((m, i) => {
                  const Icon = SECTION_META[m.type].icon;
                  return (
                    <li
                      key={m.id}
                      className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_2rem] items-center gap-3 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                        <Icon className="size-3.5 shrink-0" />
                        <span className="truncate">
                          {m.type === "CUSTOM"
                            ? m.title
                            : SECTION_META[m.type].label}
                        </span>
                      </span>
                      <span className="h-2 overflow-hidden rounded-full bg-muted">
                        <motion.span
                          className="block h-full rounded-full bg-[linear-gradient(90deg,var(--secondary),var(--primary))]"
                          initial={{ width: 0 }}
                          animate={{ width: `${(m.count / mixMax) * 100}%` }}
                          transition={{
                            duration: 0.9,
                            delay: 0.4 + i * 0.08,
                            ease: EASE,
                          }}
                        />
                      </span>
                      <span className="text-right font-mono text-xs tabular-nums">
                        {m.count}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

/** Greeting banner with drifting theme glows, quick actions and the profile-score ring. */
function Welcome({
  settings,
  checklist,
}: {
  settings: SiteSettings;
  checklist: { done: boolean; label: string; href: string }[];
}) {
  const reduce = useReducedMotion();
  const firstName = (settings.ownerName || "there").split(" ")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const done = checklist.filter((c) => c.done).length;
  const todo = checklist.filter((c) => !c.done);

  return (
    <Card className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -top-24 -left-16 size-72 rounded-full bg-secondary/35 blur-[90px]"
          animate={reduce ? undefined : { x: [0, 60, 0], y: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-10 -bottom-28 size-72 rounded-full bg-primary/15 blur-[90px]"
          animate={reduce ? undefined : { x: [0, -50, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="bg-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(90deg,black,transparent_70%)]" />
      </div>

      <div className="relative flex flex-wrap items-center gap-6 p-6 sm:p-7">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{today}</p>
          <h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            <span>
              {greeting}, <span className="text-joker">{firstName}</span>
            </span>
            <motion.span
              aria-hidden
              className="inline-block text-primary"
              animate={
                reduce
                  ? undefined
                  : { rotate: [0, 90, 180], scale: [1, 1.25, 1] }
              }
              transition={{
                duration: 2.4,
                repeat: Infinity,
                repeatDelay: 1.6,
                ease: "easeInOut",
              }}
            >
              ✦
            </motion.span>
          </h1>
          <p className="mt-1.5 max-w-lg text-sm text-muted-foreground">
            Here&apos;s how your portfolio looks right now. Changes you save go
            live within seconds.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/admin/sections" className={buttonClass()}>
              <LayoutList /> Edit sections
            </Link>
            <a href="/" target="_blank" className={buttonClass("secondary")}>
              <ExternalLink /> View site
            </a>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <ScoreRing value={done} total={checklist.length} />
          <div className="min-w-0 text-sm">
            <p className="font-medium">Profile score</p>
            {todo.length === 0 ? (
              <p className="mt-1 flex items-center gap-1.5 text-chart-3">
                <Check className="size-4" /> Everything&apos;s set up
              </p>
            ) : (
              <ul className="mt-1.5 grid gap-1">
                {todo.slice(0, 3).map((t) => (
                  <li key={t.label}>
                    <Link
                      href={t.href}
                      className="group flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <span className="size-1.5 rounded-full bg-primary" />
                      Add {t.label.toLowerCase()}
                      <ArrowRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function ScoreRing({ value, total }: { value: number; total: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const pct = total ? value / total : 0;
  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 80 80" className="size-full -rotate-90">
        <defs>
          <linearGradient id="score-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--secondary)" />
            <stop offset="1" stopColor="var(--primary)" />
          </linearGradient>
        </defs>
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="7"
        />
        <motion.circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="url(#score-ring)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1.4, delay: 0.3, ease: EASE }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-xl font-bold tabular-nums">
          <CountUp value={Math.round(pct * 100)} suffix="%" />
        </span>
      </div>
    </div>
  );
}

/** Stat tile: counts up, lifts on hover, and fills a thin bar when it has a part/whole. */
function Stat({
  icon: Icon,
  label,
  value,
  note,
  href,
  tone,
  part,
  whole,
  pulse,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  note: string;
  href: string;
  tone: string;
  part?: number;
  whole?: number;
  pulse?: boolean;
}) {
  const fill = part !== undefined && whole ? part / whole : undefined;
  return (
    <motion.div
      variants={rise}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Link
        href={href}
        className="group block h-full"
        style={{ "--tone": tone } as CSSProperties}
      >
        <Card className="relative h-full overflow-hidden p-5 transition-colors group-hover:border-[color-mix(in_oklch,var(--tone)_45%,var(--border))]">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-[var(--tone)] opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
          />
          <div className="relative flex items-center justify-between text-sm text-muted-foreground">
            {label}
            <span className="relative grid size-8 place-items-center rounded-lg border border-border bg-background/60 text-[var(--tone)] transition-transform group-hover:scale-110">
              <Icon className="size-4" />
              {pulse && (
                <span className="absolute inset-0 animate-ping rounded-lg border border-[var(--tone)] motion-reduce:animate-none" />
              )}
            </span>
          </div>
          <p className="relative mt-3 font-display text-4xl font-bold tabular-nums">
            <CountUp value={value} />
          </p>
          <p className="relative mt-1 text-xs text-muted-foreground">{note}</p>
          {fill !== undefined && (
            <div className="relative mt-4 h-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-[var(--tone)]"
                initial={{ width: 0 }}
                animate={{ width: `${fill * 100}%` }}
                transition={{ duration: 1, delay: 0.5, ease: EASE }}
              />
            </div>
          )}
        </Card>
      </Link>
    </motion.div>
  );
}
