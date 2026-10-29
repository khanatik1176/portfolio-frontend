"use client";

import { useCallback, useEffect, useState } from "react";
import { api, json } from "@/lib/api";
import { SECTION_TYPES, type Section } from "@/lib/types";
import { ItemEditor } from "./ItemEditor";
import { JsonField } from "./JsonField";
import { Button, Card, ErrorText, Field, inputClass } from "./ui";

/** Remount with `key={id}` when switching sections to reset local state. */
/** Content / item fields each section type's component reads on the public site. */
const TYPE_HINTS: Partial<Record<Section["type"], string>> = {
  HERO: 'content: currentRole{ title, company, since: "2025-10-01", summary } (shown in the status panel), openTo[] (roles cycling in the status panel), rolePrefix, roles[], ctaLabel, ctaHref, secondaryCtaLabel, secondaryCtaHref, stack[] (orbiting icons, e.g. "Next.js"), chips[{ value, label }] (floating cards), availability, timeZone (e.g. Asia/Dhaka for the live clock). Photo = Avatar URL in Site settings. Title = small line above your name.',
  ABOUT: 'content: body, stats[{ value, suffix, label, decimals }], traits[], interests[]',
  SKILLS: "One item per category: title = category, subtitle = tagline, tags = skills.",
  EXPERIENCE: "Items: title = role, subtitle = company, dates, description, tags. Item data: location, highlights[], logoUrl (company logo, e.g. /images/logos/aci.png). No end date = current job.",
  EDUCATION: "Items: title = degree, subtitle = institution, dates. Item data: grade, gradeLabel.",
  PROJECTS: "Items: subtitle = context line, tags, link. Item data: featured (wide card), highlights[], repoUrl, badge.",
  CONTACT: "Uses your email, location and social links from Site settings.",
  CUSTOM: "Centered spotlight cards. Item data: badge (big circle, e.g. \"4x\"). content: body.",
};

export function SectionEditor({ id, onChanged }: { id: string; onChanged: () => void }) {
  const [section, setSection] = useState<Section | null>(null);
  const [editingItem, setEditingItem] = useState<string | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(
    () => api<Section>(`/sections/${id}`).then(setSection, (e) => setError(e.message)),
    [id],
  );

  useEffect(() => {
    void load();
  }, [load]);

  if (!section) return <ErrorText error={error} />;

  const set = (patch: Partial<Section>) => {
    setSection({ ...section, ...patch });
    setSaved(false);
  };

  async function save() {
    setError(null);
    const { slug, type, title, subtitle, content, isVisible } = section!;
    try {
      await api(`/sections/${id}`, {
        method: "PATCH",
        body: json({ slug, type, title, subtitle: subtitle || undefined, content, isVisible }),
      });
      setSaved(true);
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function itemAction(path: string, method: string, body?: unknown) {
    await api(path, { method, body: body ? json(body) : undefined });
    await load();
  }

  function moveItem(index: number, delta: number) {
    const ids = section!.items.map((i) => i.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(index + delta, 0, moved);
    void itemAction("/sections/items/reorder", "PATCH", { ids });
  }

  return (
    <div className="grid gap-6">
      <Card className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <input value={section.title} onChange={(e) => set({ title: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Slug (anchor)">
            <input value={section.slug} onChange={(e) => set({ slug: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Type">
            <select
              value={section.type}
              onChange={(e) => set({ type: e.target.value as Section["type"] })}
              className={inputClass}
            >
              {SECTION_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Subtitle">
            <input
              value={section.subtitle ?? ""}
              onChange={(e) => set({ subtitle: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
        {TYPE_HINTS[section.type] && (
          <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">{TYPE_HINTS[section.type]}</p>
        )}
        <JsonField
          key={section.id}
          label='Content (JSON, e.g. {"body": "..."} or {"ctaLabel": "...", "ctaHref": "#projects"})'
          value={section.content}
          onChange={(content) => set({ content })}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={section.isVisible}
            onChange={(e) => set({ isVisible: e.target.checked })}
          />
          Visible on site
        </label>
        <div className="flex items-center gap-4">
          <Button onClick={save}>Save section</Button>
          {saved && <span className="text-sm text-green-600">Saved</span>}
          <ErrorText error={error} />
        </div>
      </Card>

      <Card className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Items ({section.items.length})</h2>
          <Button variant="ghost" onClick={() => setEditingItem("new")}>
            + Add item
          </Button>
        </div>
        {editingItem === "new" && (
          <ItemEditor sectionId={id} onDone={() => { setEditingItem(null); void load(); }} />
        )}
        {section.items.map((item, i) =>
          editingItem === item.id ? (
            <ItemEditor
              key={item.id}
              sectionId={id}
              item={item}
              onDone={() => { setEditingItem(null); void load(); }}
            />
          ) : (
            <div key={item.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
              <span className={item.isVisible ? "flex-1" : "flex-1 text-muted-foreground line-through"}>
                {item.title}
              </span>
              <Button variant="ghost" disabled={i === 0} onClick={() => moveItem(i, -1)}>↑</Button>
              <Button variant="ghost" disabled={i === section.items.length - 1} onClick={() => moveItem(i, 1)}>↓</Button>
              <Button
                variant="ghost"
                onClick={() => itemAction(`/sections/items/${item.id}`, "PATCH", { isVisible: !item.isVisible })}
              >
                {item.isVisible ? "Hide" : "Show"}
              </Button>
              <Button variant="ghost" onClick={() => setEditingItem(item.id)}>Edit</Button>
              <Button
                variant="danger"
                onClick={() => confirm(`Delete "${item.title}"?`) && itemAction(`/sections/items/${item.id}`, "DELETE")}
              >
                Delete
              </Button>
            </div>
          ),
        )}
      </Card>
    </div>
  );
}
