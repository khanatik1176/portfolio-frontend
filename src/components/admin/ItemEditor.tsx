"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { api, json } from "@/lib/api";
import type { SectionItem } from "@/lib/types";
import { useFeedback } from "./feedback";
import { JsonField } from "./JsonField";
import type { ItemShape } from "./schema";
import { SchemaForm, TagInput } from "./SchemaForm";
import { Button, Drawer, ErrorText, Field, inputClass, Switch } from "./ui";

export type ItemDraft = Omit<SectionItem, "id" | "sectionId" | "order">;

const EMPTY: ItemDraft = {
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

// Dates are picked by month; stored as the first of that month (UTC).
const toMonth = (d: string | null) => (d ? d.slice(0, 7) : "");
const fromMonth = (m: string) => (m ? `${m}-01T00:00:00.000Z` : null);

/**
 * Drawer that creates (no `item`) or edits a section item. Fields and labels
 * follow the section's layout (`shape`), so a job asks for Role and Company
 * while a paper asks for Venue. Every change is reported through `onDraft` so
 * the live preview shows it before saving. Remount with a new `key` per item.
 */
export function ItemEditor({
  open,
  sectionId,
  item,
  shape,
  onDraft,
  onClose,
  onSaved,
}: {
  open: boolean;
  sectionId: string;
  item?: SectionItem;
  shape: ItemShape;
  onDraft: (draft: ItemDraft) => void;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useFeedback();
  const [draft, setDraft] = useState<ItemDraft>(item ?? EMPTY);
  const [ongoing, setOngoing] = useState(!!item?.startDate && !item.endDate);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formRev, setFormRev] = useState(0);
  const [jsonRev, setJsonRev] = useState(0);
  const set = (patch: Partial<ItemDraft>) =>
    setDraft((d) => ({ ...d, ...patch }));

  useEffect(() => {
    if (open) onDraft(draft);
  }, [open, draft, onDraft]);

  async function save() {
    setSaving(true);
    setError(null);
    // Send empty strings as undefined so optional fields validate.
    const body = Object.fromEntries(
      Object.entries(draft).filter(([, v]) => v !== "" && v !== null),
    );
    try {
      await api(
        item ? `/sections/items/${item.id}` : `/sections/${sectionId}/items`,
        {
          method: item ? "PATCH" : "POST",
          body: json(body),
        },
      );
      toast(item ? `Saved “${draft.title}”` : `Added “${draft.title}”`);
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const text = (
    key: "title" | "subtitle" | "link",
    label: string,
    placeholder?: string,
  ) => (
    <Field label={label}>
      <input
        type={key === "link" ? "url" : "text"}
        value={draft[key] ?? ""}
        placeholder={placeholder}
        onChange={(e) => set({ [key]: e.target.value })}
        className={inputClass}
      />
    </Field>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={item ? `Edit ${shape.noun}` : `New ${shape.noun}`}
      description="Changes show in the live preview as you type."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!draft.title || saving}>
            {saving ? "Saving…" : item ? "Save" : `Add ${shape.noun}`}
          </Button>
        </>
      }
    >
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {text("title", shape.title)}
          {shape.subtitle && text("subtitle", shape.subtitle)}
          {shape.link && (
            <div className="sm:col-span-2">
              {text("link", shape.link, "https://…")}
            </div>
          )}
        </div>

        {shape.dates && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={shape.dates.start}>
              <input
                type="month"
                value={toMonth(draft.startDate)}
                onChange={(e) => set({ startDate: fromMonth(e.target.value) })}
                className={inputClass}
              />
            </Field>
            {shape.dates.end && (
              <Field label={shape.dates.end}>
                {ongoing ? (
                  <input disabled value="Present" className={inputClass} />
                ) : (
                  <input
                    type="month"
                    value={toMonth(draft.endDate)}
                    onChange={(e) =>
                      set({ endDate: fromMonth(e.target.value) })
                    }
                    className={inputClass}
                  />
                )}
              </Field>
            )}
            {shape.dates.end && (
              <label className="flex items-center gap-2.5 text-sm sm:col-span-2">
                <Switch
                  label="Still here"
                  checked={ongoing}
                  onChange={(v) => {
                    setOngoing(v);
                    if (v) set({ endDate: null });
                  }}
                />
                {shape.noun === "degree"
                  ? "I'm still studying here"
                  : "I currently work here"}
              </label>
            )}
          </div>
        )}

        {shape.description && (
          <Field label={shape.description}>
            <textarea
              rows={4}
              value={draft.description ?? ""}
              onChange={(e) => set({ description: e.target.value })}
              className={inputClass}
            />
          </Field>
        )}

        {shape.tags && (
          <Field
            label={shape.tags}
            hint="Type and press Enter (or a comma) after each one."
          >
            <TagInput
              value={draft.tags}
              onChange={(tags) => set({ tags })}
              placeholder="e.g. React"
            />
          </Field>
        )}

        {shape.data.length > 0 && (
          <SchemaForm
            key={jsonRev}
            fields={shape.data}
            value={draft.data}
            onChange={(data) => {
              set({ data });
              setFormRev((r) => r + 1);
            }}
          />
        )}

        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <div>
            <p className="text-sm font-medium">Visible on site</p>
            <p className="text-xs text-muted-foreground">
              Hidden {shape.noun}s stay saved but don&apos;t appear publicly.
            </p>
          </div>
          <Switch
            label="Visible on site"
            checked={draft.isVisible}
            onChange={(isVisible) => set({ isVisible })}
          />
        </div>

        <details className="group rounded-lg border border-border">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground select-none hover:text-foreground">
            <ChevronRight className="size-4 transition-transform group-open:rotate-90" />
            Advanced: extra data as JSON
          </summary>
          <div className="border-t border-border p-3">
            <JsonField
              key={formRev}
              label="Raw extra data"
              hint="For developers. The fields above stay in sync."
              value={draft.data}
              onChange={(data) => {
                set({ data });
                setJsonRev((r) => r + 1);
              }}
              rows={6}
            />
          </div>
        </details>

        <ErrorText error={error} />
        <button type="submit" hidden />
      </form>
    </Drawer>
  );
}
