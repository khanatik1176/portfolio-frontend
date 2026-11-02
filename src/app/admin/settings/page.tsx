"use client";

import { AnimatePresence, motion } from "motion/react";
import { Link2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useFeedback } from "@/components/admin/feedback";
import { setField } from "@/components/admin/schema";
import {
  Button,
  Card,
  EmptyState,
  ErrorText,
  Field,
  IconButton,
  inputClass,
  Kbd,
  PageHeader,
  Skeleton,
} from "@/components/admin/ui";
import { SocialIcon } from "@/components/fx/SocialIcon";
import { api, json } from "@/lib/api";
import type { SiteSettings, SocialLink } from "@/lib/types";

/** Settings group: title and description on the left, fields on the right (stacked on small screens). */
function Group({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-4 border-b border-border py-8 first:pt-2 last:border-0 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Card className="grid gap-4 p-5 sm:grid-cols-2">{children}</Card>
    </section>
  );
}

export default function SettingsPage() {
  const { toast } = useFeedback();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState<SiteSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<SiteSettings>("/settings").then(
      (s) => {
        setSettings(s);
        setSaved(s);
      },
      (e) => setError(e.message),
    );
  }, []);

  const dirty =
    !!settings && JSON.stringify(settings) !== JSON.stringify(saved);

  const save = useCallback(async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    const s = settings;
    const body = {
      siteName: s.siteName,
      ownerName: s.ownerName,
      headline: s.headline,
      bio: s.bio,
      avatarUrl: s.avatarUrl || undefined,
      resumeUrl: s.resumeUrl || undefined,
      email: s.email || undefined,
      location: s.location || undefined,
      socials: s.socials,
      seo: s.seo,
    };
    try {
      const next = await api<SiteSettings>("/settings", {
        method: "PATCH",
        body: json(body),
      });
      setSettings(next);
      setSaved(next);
      toast("Settings saved, live on the site");
    } catch (e) {
      setError((e as Error).message);
      toast("Couldn't save settings", "error");
    } finally {
      setSaving(false);
    }
  }, [settings, toast]);

  // ⌘S / Ctrl+S saves.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty && !saving) void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, saving, save]);

  if (!settings) {
    return error ? (
      <ErrorText error={error} />
    ) : (
      <div className="grid max-w-5xl gap-4">
        <Skeleton className="h-10 w-60" />
        <Skeleton className="h-72" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setSettings({ ...settings, [key]: value });
  const text = (
    key: keyof SiteSettings,
    label: string,
    placeholder?: string,
    hint?: string,
  ) => (
    <Field label={label} hint={hint}>
      <input
        value={(settings[key] as string | null) ?? ""}
        placeholder={placeholder}
        onChange={(e) => set(key, e.target.value as never)}
        className={inputClass}
      />
    </Field>
  );
  const updateSocial = (i: number, patch: Partial<SocialLink>) =>
    set(
      "socials",
      settings.socials.map((s, j) => (j === i ? { ...s, ...patch } : s)),
    );

  const seo = settings.seo as { title?: string; description?: string };
  const siteHost = typeof window === "undefined" ? "" : window.location.host;

  return (
    <div className="max-w-5xl pb-24">
      <PageHeader
        title="Site settings"
        description="Your identity, contact details and search appearance, used across the whole site."
      />
      {error && (
        <div className="mt-4">
          <ErrorText error={error} />
        </div>
      )}

      <div className="mt-6">
        <Group
          title="Profile"
          description="Who you are. Your name and headline lead the hero; the avatar is the photo on the Joker card."
        >
          {text("ownerName", "Your name", "Jane Doe")}
          {text(
            "siteName",
            "Site name",
            "Jane Doe Portfolio",
            "Shown in the browser tab when no SEO title is set.",
          )}
          <div className="sm:col-span-2">
            {text("headline", "Headline", "Full-stack engineer building…")}
          </div>
          <div className="flex items-end gap-3 sm:col-span-2">
            {settings.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-provided URL
              <img
                src={settings.avatarUrl}
                alt=""
                className="size-[38px] shrink-0 rounded-lg border border-border object-cover"
              />
            ) : (
              <span className="size-[38px] shrink-0 rounded-lg border border-dashed border-border" />
            )}
            <div className="flex-1">
              {text("avatarUrl", "Avatar URL", "https://…")}
            </div>
          </div>
          <Field
            label="Bio"
            className="sm:col-span-2"
            hint={`${settings.bio.length} characters`}
          >
            <textarea
              rows={5}
              value={settings.bio}
              onChange={(e) => set("bio", e.target.value)}
              className={inputClass}
            />
          </Field>
        </Group>

        <Group
          title="Contact"
          description="How visitors reach you. Shown in the contact section, footer and command palette."
        >
          {text("email", "Public email", "you@example.com")}
          {text("location", "Location", "Dhaka, Bangladesh")}
          <div className="sm:col-span-2">
            {text(
              "resumeUrl",
              "Resume URL",
              "https://…/cv.pdf",
              "Powers the “Download CV” buttons.",
            )}
          </div>
        </Group>

        <Group
          title="Social links"
          description="Profiles shown as icons. The platform name picks the icon, e.g. github, linkedin, x."
        >
          <div className="grid gap-2 sm:col-span-2">
            {settings.socials.length === 0 && (
              <EmptyState
                icon={<Link2 />}
                title="No links yet"
                description="Add GitHub, LinkedIn or anywhere else people can find you."
              />
            )}
            {settings.socials.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-muted text-muted-foreground">
                  <SocialIcon platform={s.platform} className="size-4" />
                </span>
                <input
                  placeholder="platform"
                  aria-label="Platform"
                  value={s.platform}
                  onChange={(e) =>
                    updateSocial(i, { platform: e.target.value })
                  }
                  className={`${inputClass} w-28 sm:w-36`}
                />
                <input
                  placeholder="https://"
                  aria-label="URL"
                  value={s.url}
                  onChange={(e) => updateSocial(i, { url: e.target.value })}
                  className={inputClass}
                />
                <IconButton
                  label="Remove link"
                  tone="danger"
                  onClick={() =>
                    set(
                      "socials",
                      settings.socials.filter((_, j) => j !== i),
                    )
                  }
                >
                  <Trash2 />
                </IconButton>
              </div>
            ))}
            <Button
              variant="secondary"
              size="sm"
              className="mt-1 w-fit"
              onClick={() =>
                set("socials", [...settings.socials, { platform: "", url: "" }])
              }
            >
              <Plus /> Add link
            </Button>
          </div>
        </Group>

        <Group
          title="SEO"
          description="How the site appears in search results and link previews."
        >
          <Field
            label="Page title"
            className="sm:col-span-2"
            hint={<CharCount value={seo.title ?? ""} max={60} />}
          >
            <input
              value={seo.title ?? ""}
              placeholder={settings.siteName || "Jane Doe · Software Engineer"}
              onChange={(e) =>
                set("seo", setField(settings.seo, "title", e.target.value))
              }
              className={inputClass}
            />
          </Field>
          <Field
            label="Description"
            className="sm:col-span-2"
            hint={<CharCount value={seo.description ?? ""} max={160} />}
          >
            <textarea
              rows={3}
              value={seo.description ?? ""}
              placeholder={
                settings.headline ||
                "One or two sentences about you and your work."
              }
              onChange={(e) =>
                set(
                  "seo",
                  setField(settings.seo, "description", e.target.value),
                )
              }
              className={inputClass}
            />
          </Field>
          {/* Search result preview */}
          <div className="rounded-lg border border-border bg-background/60 p-4 sm:col-span-2">
            <p className="mb-2 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Search preview
            </p>
            <p className="truncate text-xs text-muted-foreground">{siteHost}</p>
            <p className="mt-0.5 truncate text-lg text-[oklch(0.75_0.12_260)]">
              {seo.title || settings.siteName || "Your page title"}
            </p>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {seo.description ||
                settings.headline ||
                "Your description appears here."}
            </p>
          </div>
        </Group>
      </div>

      {/* Save bar slides up while there are unsaved changes */}
      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
            className="fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-xl items-center gap-3 rounded-xl border border-border bg-popover/95 p-2 pl-4 shadow-xl backdrop-blur-xl lg:left-64"
          >
            <span className="size-2 shrink-0 rounded-full bg-primary" />
            <p className="flex-1 text-sm">Unsaved changes</p>
            <Button variant="ghost" onClick={() => setSettings(saved)}>
              Discard
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
              {!saving && (
                <span className="hidden opacity-70 sm:inline">
                  <Kbd>⌘S</Kbd>
                </span>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** "42 / 60" that turns red past the recommended length. */
function CharCount({ value, max }: { value: string; max: number }) {
  return (
    <span className={value.length > max ? "text-destructive" : undefined}>
      {value.length} / {max} characters
      {value.length > max && " (search engines may cut it off)"}
    </span>
  );
}
