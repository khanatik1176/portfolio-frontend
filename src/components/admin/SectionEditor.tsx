"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Columns2,
  Eye,
  EyeOff,
  Info,
  ListPlus,
  PanelLeft,
  Pencil,
  Rows3,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import type { SectionProps } from "@/components/sections/types";
import { api, json } from "@/lib/api";
import {
  SECTION_TYPES,
  type Portfolio,
  type Section,
  type SectionItem,
} from "@/lib/types";
import { useFeedback } from "./feedback";
import { ItemEditor, type ItemDraft } from "./ItemEditor";
import { JsonField } from "./JsonField";
import { SECTION_META } from "./meta";
import {
  CONTENT_FIELDS,
  CUSTOM_LAYOUT_FIELD,
  ITEM_SHAPES,
  LAYOUT_ABOUT,
  layoutOf,
} from "./schema";
import { SchemaForm } from "./SchemaForm";
import { SectionPreview } from "./SectionPreview";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorText,
  Field,
  IconButton,
  inputClass,
  Kbd,
  Segmented,
  Skeleton,
  Switch,
  Tabs,
} from "./ui";

type Tab = "content" | "items" | "settings";
type View = "edit" | "split" | "preview";
type Editable = Pick<
  Section,
  "slug" | "type" | "title" | "subtitle" | "content" | "isVisible"
>;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const editable = ({
  slug,
  type,
  title,
  subtitle,
  content,
  isVisible,
}: Section): Editable => ({ slug, type, title, subtitle, content, isVisible });

/**
 * Edits one section with a live preview beside it. Remount with `key={id}`
 * when switching sections; `onDirtyChange` lets the list guard unsaved edits.
 */
export function SectionEditor({
  id,
  onChanged,
  onDirtyChange,
}: {
  id: string;
  onChanged: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const { toast, confirm } = useFeedback();
  const [section, setSection] = useState<Section | null>(null);
  const [saved, setSaved] = useState<Editable | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("content");
  const [view, setView] = useState<View>("split");
  const [jsonKey, setJsonKey] = useState(0);
  // Bumped by each editor so the other remounts with the latest content.
  const [formRev, setFormRev] = useState(0);
  const [jsonRev, setJsonRev] = useState(0);
  const [context, setContext] = useState<Portfolio | null>(null);
  const [editing, setEditing] = useState<{
    item?: SectionItem;
    key: number;
  } | null>(null);
  const [itemDraft, setItemDraft] = useState<ItemDraft | null>(null);

  const load = useCallback(
    () =>
      api<Section>(`/sections/${id}`).then(
        (s) => {
          setSection(s);
          setSaved(editable(s));
        },
        (e) => setError(e.message),
      ),
    [id],
  );

  useEffect(() => {
    void load();
  }, [load]);

  // Settings and the other sections give the preview the same context the site has.
  useEffect(() => {
    api<Portfolio>("/portfolio").then(setContext, () => {});
  }, []);

  const dirty =
    !!section &&
    !!saved &&
    JSON.stringify(editable(section)) !== JSON.stringify(saved);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const save = useCallback(async () => {
    if (!section) return;
    setSaving(true);
    setError(null);
    const { slug, type, title, subtitle, content, isVisible } = section;
    try {
      await api(`/sections/${id}`, {
        method: "PATCH",
        body: json({
          slug,
          type,
          title,
          subtitle: subtitle || undefined,
          content,
          isVisible,
        }),
      });
      setSaved(editable(section));
      toast(`Saved “${title}”, live on the site`);
      onChanged();
    } catch (e) {
      setError((e as Error).message);
      toast("Couldn't save the section", "error");
    } finally {
      setSaving(false);
    }
  }, [id, section, onChanged, toast]);

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

  const previewProps = useMemo<SectionProps | null>(() => {
    if (!section || !context) return null;
    let items = section.items;
    if (editing && itemDraft) {
      const draftItem = {
        ...(editing.item ?? {
          id: "draft",
          sectionId: id,
          order: items.length,
        }),
        ...itemDraft,
      } as SectionItem;
      items = editing.item
        ? items.map((i) => (i.id === editing.item!.id ? draftItem : i))
        : [...items, draftItem];
    }
    // The public site only sends visible items.
    const draft = { ...section, items: items.filter((i) => i.isVisible) };
    const others = context.sections.filter((s) => s.id !== id);
    const sections = [...others, draft].sort((a, b) => a.order - b.order);
    const index =
      draft.type === "HERO"
        ? 0
        : sections
            .filter((s) => s.type !== "HERO")
            .findIndex((s) => s.id === id) + 1;
    return { section: draft, settings: context.settings, sections, index };
  }, [section, context, editing, itemDraft, id]);

  const onItemDraft = useCallback((d: ItemDraft) => setItemDraft(d), []);
  const closeItem = useCallback(() => {
    setEditing(null);
    setItemDraft(null);
  }, []);

  if (!section) {
    return error ? (
      <ErrorText error={error} />
    ) : (
      <div className="grid gap-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const set = (patch: Partial<Section>) => setSection({ ...section, ...patch });
  const meta = SECTION_META[section.type];
  const layout = layoutOf(section);
  const itemShape = ITEM_SHAPES[layout];
  const contentFields =
    section.type === "CUSTOM"
      ? [CUSTOM_LAYOUT_FIELD, ...CONTENT_FIELDS[layout]]
      : CONTENT_FIELDS[layout];
  const Icon = meta.icon;

  async function itemAction(
    path: string,
    method: string,
    body?: unknown,
    message?: string,
  ) {
    try {
      await api(path, { method, body: body ? json(body) : undefined });
      if (message) toast(message);
      await load();
      onChanged();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  function moveItem(index: number, delta: number) {
    const ids = section!.items.map((i) => i.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(index + delta, 0, moved);
    void itemAction("/sections/items/reorder", "PATCH", { ids });
  }

  async function discard() {
    if (
      !(await confirm({
        title: "Discard changes?",
        description: "Your unsaved edits to this section will be lost.",
        confirmLabel: "Discard",
        danger: true,
      }))
    )
      return;
    setSection({ ...section!, ...saved! });
    setJsonKey((k) => k + 1);
  }

  const editor = (
    <Card className="min-w-0">
      <div className="px-5 pt-3">
        <Tabs
          layoutId="section-editor-tab"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "content", label: "Content" },
            ...(itemShape || section.items.length
              ? [
                  {
                    value: "items" as const,
                    label: (
                      <>
                        {itemShape ? `${capitalize(itemShape.noun)}s` : "Items"}{" "}
                        <Badge>{section.items.length}</Badge>
                      </>
                    ),
                  },
                ]
              : []),
            { value: "settings", label: "Settings" },
          ]}
        />
      </div>

      <div className="p-5">
        {tab === "settings" && (
          <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title">
                <input
                  value={section.title}
                  onChange={(e) => set({ title: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Subtitle">
                <input
                  value={section.subtitle ?? ""}
                  placeholder="Optional"
                  onChange={(e) => set({ subtitle: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field
                label="Anchor"
                hint="The link to this section, e.g. yoursite.com/#about."
              >
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-border bg-muted px-2.5 font-mono text-xs text-muted-foreground">
                    /#
                  </span>
                  <input
                    value={section.slug}
                    onChange={(e) => set({ slug: e.target.value })}
                    className={clsx(inputClass, "rounded-l-none font-mono")}
                  />
                </div>
              </Field>
              <Field label="Layout type">
                <select
                  value={section.type}
                  onChange={(e) =>
                    set({ type: e.target.value as Section["type"] })
                  }
                  className={inputClass}
                >
                  {SECTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {SECTION_META[t].label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">Visible on site</p>
                <p className="text-xs text-muted-foreground">
                  Hidden sections are kept but left out of the public page.
                </p>
              </div>
              <Switch
                label="Visible on site"
                checked={section.isVisible}
                onChange={(isVisible) => set({ isVisible })}
              />
            </div>
          </div>
        )}

        {tab === "content" && (
          <div className="grid gap-5">
            <div className="flex gap-2.5 rounded-lg border border-secondary/40 bg-secondary/10 px-3 py-2.5 text-sm leading-relaxed text-accent-foreground">
              <Info className="mt-0.5 size-4 shrink-0" />
              <p>{LAYOUT_ABOUT[layout]}</p>
            </div>
            {contentFields.length > 0 ? (
              <SchemaForm
                key={`${section.id}-${jsonKey}-${jsonRev}`}
                fields={contentFields}
                value={section.content}
                onChange={(content) => {
                  set({ content });
                  setFormRev((r) => r + 1);
                }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {itemShape
                  ? `Nothing to fill in here. This section is built from its ${itemShape.noun}s.`
                  : "Nothing to fill in here."}
              </p>
            )}
            {itemShape && (
              <Button
                variant="secondary"
                className="w-fit"
                onClick={() => setTab("items")}
              >
                Manage {itemShape.noun}s <ChevronRight />
              </Button>
            )}
            <details className="group rounded-lg border border-border">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground select-none hover:text-foreground">
                <ChevronRight className="size-4 transition-transform group-open:rotate-90" />
                Advanced: edit as JSON
              </summary>
              <div className="border-t border-border p-3">
                <JsonField
                  key={`${section.id}-${jsonKey}-${formRev}`}
                  label="Raw content"
                  hint="For developers. The form above stays in sync."
                  value={section.content}
                  onChange={(content) => {
                    set({ content });
                    setJsonRev((r) => r + 1);
                  }}
                  rows={10}
                />
              </div>
            </details>
          </div>
        )}

        {tab === "items" && (
          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Items save on their own; order and visibility apply right away.
              </p>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setEditing({ key: Date.now() })}
              >
                <ListPlus /> Add {itemShape?.noun ?? "item"}
              </Button>
            </div>
            {section.items.length === 0 ? (
              <EmptyState
                icon={<Rows3 />}
                title={`No ${itemShape?.noun ?? "item"}s yet`}
                description={`Add your first ${itemShape?.noun ?? "item"} and it appears in the preview right away.`}
              />
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                {section.items.map((item, i) => (
                  <li
                    key={item.id}
                    className="group flex items-center gap-2 bg-background/40 px-3 py-2 transition-colors hover:bg-muted/50"
                  >
                    <button
                      type="button"
                      onClick={() => setEditing({ item, key: Date.now() })}
                      className="min-w-0 flex-1 py-1 text-left"
                    >
                      <p
                        className={clsx(
                          "truncate text-sm font-medium",
                          !item.isVisible &&
                            "text-muted-foreground line-through",
                        )}
                      >
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="truncate text-xs text-muted-foreground">
                          {item.subtitle}
                        </p>
                      )}
                    </button>
                    <div className="flex items-center opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                      <IconButton
                        label="Move up"
                        disabled={i === 0}
                        onClick={() => moveItem(i, -1)}
                      >
                        <ArrowUp />
                      </IconButton>
                      <IconButton
                        label="Move down"
                        disabled={i === section.items.length - 1}
                        onClick={() => moveItem(i, 1)}
                      >
                        <ArrowDown />
                      </IconButton>
                      <IconButton
                        label="Edit"
                        onClick={() => setEditing({ item, key: Date.now() })}
                      >
                        <Pencil />
                      </IconButton>
                      <IconButton
                        label="Delete"
                        tone="danger"
                        onClick={async () => {
                          if (
                            await confirm({
                              title: `Delete “${item.title}”?`,
                              description: "This removes the item permanently.",
                              confirmLabel: "Delete",
                              danger: true,
                            })
                          )
                            void itemAction(
                              `/sections/items/${item.id}`,
                              "DELETE",
                              undefined,
                              `Deleted “${item.title}”`,
                            );
                        }}
                      >
                        <Trash2 />
                      </IconButton>
                    </div>
                    <Switch
                      label={item.isVisible ? "Hide item" : "Show item"}
                      checked={item.isVisible}
                      onChange={(isVisible) =>
                        void itemAction(`/sections/items/${item.id}`, "PATCH", {
                          isVisible,
                        })
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {error && (
          <div className="mt-4">
            <ErrorText error={error} />
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className="grid min-w-0 gap-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card text-primary">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold">
              {section.title || "Untitled section"}
            </h2>
            <Badge tone="purple">{meta.label}</Badge>
            {section.isVisible ? (
              <Badge tone="success">
                <Eye className="size-3" /> Visible
              </Badge>
            ) : (
              <Badge>
                <EyeOff className="size-3" /> Hidden
              </Badge>
            )}
            {dirty && (
              <Badge tone="primary">
                <span className="size-1.5 rounded-full bg-primary" /> Unsaved
              </Badge>
            )}
          </div>
          <p className="truncate font-mono text-xs text-muted-foreground">
            /#{section.slug}
          </p>
        </div>
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "edit", label: "Editor", icon: <PanelLeft /> },
            { value: "split", label: "Split", icon: <Columns2 /> },
            { value: "preview", label: "Preview", icon: <Eye /> },
          ]}
        />
        <div className="flex items-center gap-2">
          {dirty && (
            <Button variant="ghost" onClick={discard}>
              Discard
            </Button>
          )}
          <Button onClick={save} disabled={!dirty || saving} title="Save (⌘S)">
            {saving ? "Saving…" : "Save"}
            {!saving && (
              <span className="hidden opacity-70 sm:inline">
                <Kbd>⌘S</Kbd>
              </span>
            )}
          </Button>
        </div>
      </div>

      <div
        className={clsx(
          "grid min-w-0 items-start gap-4",
          view === "split" && "2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]",
        )}
      >
        {view !== "preview" && editor}
        {view !== "edit" &&
          (previewProps ? (
            <SectionPreview
              props={previewProps}
              className={clsx(
                "2xl:sticky 2xl:top-20",
                view === "preview"
                  ? "h-[calc(100vh-11rem)] min-h-[32rem]"
                  : "h-[min(46rem,calc(100vh-11rem))] min-h-[26rem]",
              )}
            />
          ) : (
            <Skeleton className="h-[26rem]" />
          ))}
      </div>

      {editing && (
        <ItemEditor
          key={editing.key}
          open
          sectionId={id}
          item={editing.item}
          shape={itemShape ?? ITEM_SHAPES.CUSTOM!}
          onDraft={onItemDraft}
          onClose={closeItem}
          onSaved={() => {
            closeItem();
            void load();
            onChanged();
          }}
        />
      )}
    </div>
  );
}
