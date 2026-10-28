"use client";

import { useState } from "react";
import { api, json } from "@/lib/api";
import type { SectionItem } from "@/lib/types";
import { JsonField } from "./JsonField";
import { Button, ErrorText, Field, inputClass } from "./ui";

type Draft = Omit<SectionItem, "id" | "sectionId" | "order">;

const EMPTY: Draft = {
  title: "",
  subtitle: null,
  description: null,
  imageUrl: null,
  link: null,
  tags: [],
  startDate: null,
  endDate: null,
  data: {},
  isVisible: true,
};

const toDateInput = (d: string | null) => (d ? d.slice(0, 10) : "");

/** Creates (no `item`) or edits a section item. */
export function ItemEditor({
  sectionId,
  item,
  onDone,
}: {
  sectionId: string;
  item?: SectionItem;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(item ?? EMPTY);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  async function save() {
    // Send empty strings as undefined so optional fields validate.
    const body = Object.fromEntries(
      Object.entries(draft).filter(([, v]) => v !== "" && v !== null),
    );
    try {
      await api(item ? `/sections/items/${item.id}` : `/sections/${sectionId}/items`, {
        method: item ? "PATCH" : "POST",
        body: json(body),
      });
      onDone();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const text = (key: "title" | "subtitle" | "imageUrl" | "link", label: string) => (
    <Field label={label}>
      <input
        value={draft[key] ?? ""}
        onChange={(e) => set({ [key]: e.target.value })}
        className={inputClass}
      />
    </Field>
  );

  return (
    <div className="grid gap-3 rounded-lg bg-muted p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {text("title", "Title")}
        {text("subtitle", "Subtitle")}
        {text("imageUrl", "Image URL")}
        {text("link", "Link")}
        <Field label="Start date">
          <input
            type="date"
            value={toDateInput(draft.startDate)}
            onChange={(e) => set({ startDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
            className={inputClass}
          />
        </Field>
        <Field label="End date (blank = present)">
          <input
            type="date"
            value={toDateInput(draft.endDate)}
            onChange={(e) => set({ endDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Description">
        <textarea
          rows={3}
          value={draft.description ?? ""}
          onChange={(e) => set({ description: e.target.value })}
          className={inputClass}
        />
      </Field>
      <Field label="Tags (comma separated)">
        <input
          value={draft.tags.join(", ")}
          onChange={(e) =>
            set({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })
          }
          className={inputClass}
        />
      </Field>
      <JsonField label="Extra data (JSON)" value={draft.data} onChange={(data) => set({ data })} />
      <ErrorText error={error} />
      <div className="flex gap-2">
        <Button onClick={save} disabled={!draft.title}>
          {item ? "Save item" : "Add item"}
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
