"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { clsx } from "clsx";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { Button, Card, ErrorText, inputClass } from "@/components/admin/ui";
import { api, json } from "@/lib/api";
import { SECTION_TYPES, type Section } from "@/lib/types";

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () => api<Section[]>("/sections/admin").then(setSections, (e) => setError(e.message)),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const slug = data.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    try {
      const section = await api<Section>("/sections", {
        method: "POST",
        body: json({ ...data, slug }),
      });
      form.reset();
      await load();
      setSelected(section.id);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function move(index: number, delta: number) {
    const ids = sections.map((s) => s.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(index + delta, 0, moved);
    await api("/sections/reorder", { method: "PATCH", body: json({ ids }) });
    await load();
  }

  async function remove(section: Section) {
    if (!confirm(`Delete section "${section.title}" and all its items?`)) return;
    await api(`/sections/${section.id}`, { method: "DELETE" });
    if (selected === section.id) setSelected(null);
    await load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="grid content-start gap-4">
        <h1 className="text-2xl font-semibold">Sections</h1>
        <ul className="grid gap-1">
          {sections.map((s, i) => (
            <li
              key={s.id}
              className={clsx(
                "flex items-center gap-1 rounded-lg border px-2 py-1",
                selected === s.id ? "border-accent" : "border-line",
              )}
            >
              <button onClick={() => setSelected(s.id)} className="flex-1 truncate py-1 text-left text-sm">
                <span className={s.isVisible ? "" : "text-muted line-through"}>{s.title}</span>
                <span className="ml-2 font-mono text-[10px] text-muted">{s.type}</span>
              </button>
              <Button variant="ghost" className="px-2 py-1" disabled={i === 0} onClick={() => move(i, -1)}>↑</Button>
              <Button variant="ghost" className="px-2 py-1" disabled={i === sections.length - 1} onClick={() => move(i, 1)}>↓</Button>
              <Button variant="danger" className="px-2 py-1" onClick={() => remove(s)}>✕</Button>
            </li>
          ))}
        </ul>
        <Card className="p-4">
          <form onSubmit={create} className="grid gap-2">
            <p className="text-sm font-medium">New section</p>
            <input name="title" required placeholder="Title" className={inputClass} />
            <select name="type" className={inputClass} defaultValue="CUSTOM">
              {SECTION_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <Button>Add section</Button>
          </form>
        </Card>
        <ErrorText error={error} />
      </div>

      <div>
        {selected ? (
          <SectionEditor key={selected} id={selected} onChanged={load} />
        ) : (
          <p className="pt-12 text-muted">Select a section to edit it.</p>
        )}
      </div>
    </div>
  );
}
