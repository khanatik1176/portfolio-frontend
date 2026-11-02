"use client";

import {
  ArrowDown,
  ArrowUp,
  LayoutList,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { clsx } from "clsx";
import { useFeedback } from "@/components/admin/feedback";
import { SECTION_META } from "@/components/admin/meta";
import { SectionEditor } from "@/components/admin/SectionEditor";
import {
  Button,
  Card,
  Drawer,
  EmptyState,
  ErrorText,
  Field,
  IconButton,
  inputClass,
  PageHeader,
  Skeleton,
} from "@/components/admin/ui";
import { api, json } from "@/lib/api";
import { SECTION_TYPES, type Section } from "@/lib/types";

export default function SectionsPage() {
  const { toast, confirm } = useFeedback();
  const [sections, setSections] = useState<Section[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const dirty = useRef(false);

  const load = useCallback(
    () =>
      api<Section[]>("/sections/admin").then(
        (list) => {
          setSections(list);
          setSelected((cur) =>
            cur && list.some((s) => s.id === cur) ? cur : (list[0]?.id ?? null),
          );
        },
        (e) => setError(e.message),
      ),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const onDirtyChange = useCallback((d: boolean) => {
    dirty.current = d;
  }, []);

  async function select(id: string) {
    if (id === selected) return;
    if (
      dirty.current &&
      !(await confirm({
        title: "Leave without saving?",
        description: "This section has unsaved changes.",
        confirmLabel: "Leave",
        danger: true,
      }))
    )
      return;
    dirty.current = false;
    setSelected(id);
  }

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<
      string,
      string
    >;
    const slug = data.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    try {
      const section = await api<Section>("/sections", {
        method: "POST",
        body: json({ ...data, slug }),
      });
      setCreating(false);
      toast(`Created “${section.title}”`);
      await load();
      dirty.current = false;
      setSelected(section.id);
    } catch (err) {
      toast((err as Error).message, "error");
    }
  }

  async function run(action: Promise<unknown>, message?: string) {
    try {
      await action;
      if (message) toast(message);
    } catch (e) {
      toast((e as Error).message, "error");
    }
    await load();
  }

  function move(index: number, delta: number) {
    const ids = sections!.map((s) => s.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(index + delta, 0, moved);
    void run(
      api("/sections/reorder", { method: "PATCH", body: json({ ids }) }),
    );
  }

  async function remove(section: Section) {
    if (
      !(await confirm({
        title: `Delete “${section.title}”?`,
        description:
          "The section and all of its items are removed permanently.",
        confirmLabel: "Delete section",
        danger: true,
      }))
    )
      return;
    await run(
      api(`/sections/${section.id}`, { method: "DELETE" }),
      `Deleted “${section.title}”`,
    );
  }

  const filtered =
    sections?.filter((s) =>
      `${s.title} ${s.type} ${s.slug}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    ) ?? [];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <PageHeader
        title="Sections"
        description="Build the page top to bottom. Edit a section and watch the live preview update."
      >
        <Button onClick={() => setCreating(true)}>
          <Plus /> New section
        </Button>
      </PageHeader>

      <ErrorText error={error} />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Card className="overflow-hidden lg:sticky lg:top-20">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter sections"
                aria-label="Filter sections"
                className={clsx(inputClass, "h-9 pl-8")}
              />
            </div>
          </div>

          {!sections ? (
            <div className="grid gap-2 p-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<LayoutList />}
              title={query ? "No matches" : "No sections yet"}
              description={
                query
                  ? undefined
                  : "Create your first section to start building the page."
              }
            />
          ) : (
            <ol className="grid max-h-[calc(100vh-14rem)] grid-cols-[minmax(0,1fr)] gap-0.5 overflow-x-hidden overflow-y-auto p-2">
              {filtered.map((s) => {
                const i = sections.indexOf(s);
                const Icon = SECTION_META[s.type].icon;
                const active = selected === s.id;
                return (
                  <li
                    key={s.id}
                    className={clsx(
                      "group relative flex min-w-0 items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors",
                      active
                        ? "border-border bg-muted"
                        : "border-transparent hover:bg-muted/50",
                    )}
                  >
                    {active && (
                      <span className="absolute top-2 bottom-2 -left-2 w-0.5 rounded-full bg-primary" />
                    )}
                    <span className="w-5 shrink-0 text-center font-mono text-[11px] text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => select(s.id)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 py-1 text-left"
                    >
                      <Icon
                        className={clsx(
                          "size-4 shrink-0",
                          active ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <span className="min-w-0">
                        <span
                          className={clsx(
                            "block truncate text-sm",
                            active && "font-medium",
                            !s.isVisible &&
                              "text-muted-foreground line-through",
                          )}
                        >
                          {s.title}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {SECTION_META[s.type].label} · {s._count?.items ?? 0}{" "}
                          items
                        </span>
                      </span>
                    </button>
                    <div className="flex items-center opacity-100 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                      <IconButton
                        label="Move up"
                        className="size-7"
                        disabled={i === 0 || !!query}
                        onClick={() => move(i, -1)}
                      >
                        <ArrowUp />
                      </IconButton>
                      <IconButton
                        label="Move down"
                        className="size-7"
                        disabled={i === sections.length - 1 || !!query}
                        onClick={() => move(i, 1)}
                      >
                        <ArrowDown />
                      </IconButton>
                      <IconButton
                        label="Delete section"
                        tone="danger"
                        className="size-7"
                        onClick={() => remove(s)}
                      >
                        <Trash2 />
                      </IconButton>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
          {sections && sections.length > 0 && (
            <p className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
              {sections.filter((s) => s.isVisible).length} of {sections.length}{" "}
              sections visible
            </p>
          )}
        </Card>

        <div className="min-w-0">
          {selected ? (
            <SectionEditor
              key={selected}
              id={selected}
              onChanged={load}
              onDirtyChange={onDirtyChange}
            />
          ) : (
            sections && (
              <Card>
                <EmptyState
                  icon={<LayoutList />}
                  title="Select a section"
                  description="Pick a section on the left to edit it and see its live preview."
                />
              </Card>
            )
          )}
        </div>
      </div>

      <Drawer
        open={creating}
        onClose={() => setCreating(false)}
        title="New section"
        description="It's added at the end of the page. You can reorder it afterwards."
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button type="submit" form="new-section">
              Create section
            </Button>
          </>
        }
      >
        <form id="new-section" onSubmit={create} className="grid gap-4">
          <Field label="Title">
            <input
              name="title"
              required
              autoFocus
              placeholder="e.g. Selected work"
              className={inputClass}
            />
          </Field>
          <fieldset className="grid gap-2">
            <legend className="mb-1.5 text-sm font-medium text-foreground/85">
              Layout type
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {SECTION_TYPES.map((t) => {
                const Icon = SECTION_META[t].icon;
                return (
                  <label
                    key={t}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 has-[:checked]:border-primary/60 has-[:checked]:bg-primary/5"
                  >
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      defaultChecked={t === "CUSTOM"}
                      className="sr-only"
                    />
                    <Icon className="size-4 text-muted-foreground" />
                    {SECTION_META[t].label}
                  </label>
                );
              })}
            </div>
          </fieldset>
        </form>
      </Drawer>
    </div>
  );
}
