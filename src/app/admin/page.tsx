"use client";

import { useEffect, useState } from "react";
import { JsonField } from "@/components/admin/JsonField";
import { Button, Card, ErrorText, Field, inputClass } from "@/components/admin/ui";
import { api, json } from "@/lib/api";
import type { SiteSettings, SocialLink } from "@/lib/types";

const TEXT_FIELDS: { key: keyof SiteSettings; label: string }[] = [
  { key: "siteName", label: "Site name" },
  { key: "ownerName", label: "Your name" },
  { key: "headline", label: "Headline" },
  { key: "email", label: "Public email" },
  { key: "location", label: "Location" },
  { key: "avatarUrl", label: "Avatar URL" },
  { key: "resumeUrl", label: "Resume URL" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api<SiteSettings>("/settings").then(setSettings, (e) => setError(e.message));
  }, []);

  if (!settings) return <ErrorText error={error} />;

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings({ ...settings, [key]: value });
    setSaved(false);
  };

  async function save() {
    setError(null);
    const s = settings!;
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
      setSettings(await api<SiteSettings>("/settings", { method: "PATCH", body: json(body) }));
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const updateSocial = (i: number, patch: Partial<SocialLink>) =>
    set("socials", settings.socials.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  return (
    <div className="grid max-w-2xl gap-6">
      <h1 className="text-2xl font-semibold">Site settings</h1>
      <Card className="grid gap-4">
        {TEXT_FIELDS.map(({ key, label }) => (
          <Field key={key} label={label}>
            <input
              value={(settings[key] as string | null) ?? ""}
              onChange={(e) => set(key, e.target.value as never)}
              className={inputClass}
            />
          </Field>
        ))}
        <Field label="Bio">
          <textarea
            rows={4}
            value={settings.bio}
            onChange={(e) => set("bio", e.target.value)}
            className={inputClass}
          />
        </Field>
      </Card>

      <Card className="grid gap-3">
        <h2 className="font-medium">Social links</h2>
        {settings.socials.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input
              placeholder="platform"
              value={s.platform}
              onChange={(e) => updateSocial(i, { platform: e.target.value })}
              className={`${inputClass} w-36`}
            />
            <input
              placeholder="https://"
              value={s.url}
              onChange={(e) => updateSocial(i, { url: e.target.value })}
              className={inputClass}
            />
            <Button
              variant="danger"
              onClick={() => set("socials", settings.socials.filter((_, j) => j !== i))}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          variant="ghost"
          className="w-fit"
          onClick={() => set("socials", [...settings.socials, { platform: "", url: "" }])}
        >
          + Add link
        </Button>
      </Card>

      <Card>
        <JsonField label="SEO (title, description)" value={settings.seo} onChange={(v) => set("seo", v)} />
      </Card>

      <div className="flex items-center gap-4">
        <Button onClick={save}>Save changes</Button>
        {saved && <span className="text-sm text-green-600">Saved, live on the site</span>}
        <ErrorText error={error} />
      </div>
    </div>
  );
}
