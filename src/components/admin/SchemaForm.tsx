"use client";

import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { clsx } from "clsx";
import type { Json } from "@/lib/types";
import { setField, type FieldDef } from "./schema";
import { Button, Field, IconButton, inputClass, Switch } from "./ui";

/**
 * Plain form for a JSON object described by `fields`. Keys the schema doesn't
 * know are kept untouched. Remount with a new `key` to reset local text state
 * (e.g. after Discard).
 */
export function SchemaForm({
  fields,
  value,
  onChange,
  compact,
}: {
  fields: FieldDef[];
  value: Json;
  onChange: (value: Json) => void;
  /** Small records (repeater rows): up to four fields per row when there's room. */
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "grid grid-cols-2 gap-3 @xl:grid-cols-4"
          : "grid gap-4 sm:grid-cols-2"
      }
    >
      {fields.map((f) => (
        <FieldInput
          key={f.key}
          field={f}
          value={value[f.key]}
          onChange={(v) => onChange(setField(value, f.key, v))}
        />
      ))}
    </div>
  );
}

const WIDE: FieldDef["kind"][] = ["textarea", "tags", "lines", "repeater"];

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const wide = WIDE.includes(field.kind) ? "sm:col-span-2" : undefined;

  switch (field.kind) {
    case "text":
    case "url":
      return (
        <Field label={field.label} hint={field.hint} className={wide}>
          <input
            type={field.kind === "url" ? "url" : "text"}
            value={typeof value === "string" ? value : ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        </Field>
      );
    case "textarea":
      return (
        <Field label={field.label} hint={field.hint} className={wide}>
          <textarea
            rows={5}
            value={typeof value === "string" ? value : ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        </Field>
      );
    case "number":
      return (
        <Field label={field.label} hint={field.hint} className={wide}>
          <input
            type="number"
            inputMode="decimal"
            value={typeof value === "number" ? value : ""}
            placeholder={field.placeholder}
            onChange={(e) =>
              onChange(
                e.target.value === "" ? undefined : Number(e.target.value),
              )
            }
            className={inputClass}
          />
        </Field>
      );
    case "select":
      return (
        <Field label={field.label} hint={field.hint} className={wide}>
          <select
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          >
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
      );
    case "boolean":
      return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 sm:col-span-2">
          <div>
            <p className="text-sm font-medium">{field.label}</p>
            {field.hint && (
              <p className="text-xs text-muted-foreground">{field.hint}</p>
            )}
          </div>
          <Switch
            label={field.label}
            checked={value === true}
            onChange={(v) => onChange(v || undefined)}
          />
        </div>
      );
    case "tags":
      return (
        <Field label={field.label} hint={field.hint} className={wide}>
          <TagInput
            value={asStrings(value)}
            onChange={onChange}
            placeholder={field.placeholder}
          />
        </Field>
      );
    case "lines":
      return (
        <Field
          label={field.label}
          hint={field.hint ?? "One per line."}
          className={wide}
        >
          <LinesInput
            value={asStrings(value)}
            onChange={onChange}
            placeholder={field.placeholder}
          />
        </Field>
      );
    case "repeater":
      return (
        <Repeater
          field={field}
          value={Array.isArray(value) ? (value as Json[]) : []}
          onChange={onChange}
        />
      );
  }
}

const asStrings = (v: unknown) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

/** Chips input: Enter or comma adds, Backspace on an empty input removes the last chip. */
export function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const add = (text: string) => {
    const parts = text
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (parts.length)
      onChange([...value, ...parts.filter((p) => !value.includes(p))]);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div
      className={clsx(
        inputClass,
        "flex min-h-10 flex-wrap items-center gap-1.5 py-1.5 focus-within:border-primary/70 focus-within:shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_18%,transparent)]",
      )}
    >
      {value.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center gap-1 rounded-md border border-secondary/40 bg-secondary/15 py-0.5 pr-1 pl-2 text-xs text-accent-foreground"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="grid size-4 place-items-center rounded text-muted-foreground hover:bg-secondary/30 hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) =>
          e.target.value.includes(",")
            ? add(e.target.value)
            : setDraft(e.target.value)
        }
        onKeyDown={onKeyDown}
        onBlur={() => draft && add(draft)}
        placeholder={value.length ? "Add more…" : placeholder}
        className="min-w-24 flex-1 bg-transparent py-0.5 text-sm outline-none placeholder:text-muted-foreground/50"
      />
    </div>
  );
}

/** One entry per line; blank lines are dropped from the saved list. */
function LinesInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState(value.join("\n"));
  return (
    <textarea
      rows={Math.min(10, Math.max(4, value.length + 1))}
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        setText(e.target.value);
        onChange(
          e.target.value
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
        );
      }}
      className={inputClass}
    />
  );
}

function Repeater({
  field,
  value,
  onChange,
}: {
  field: Extract<FieldDef, { kind: "repeater" }>;
  value: Json[];
  onChange: (value: Json[]) => void;
}) {
  const move = (i: number, d: number) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const noun = field.itemLabel;

  return (
    <div className="grid gap-2 text-sm sm:col-span-2">
      <div>
        <p className="font-medium text-foreground/85">{field.label}</p>
        {field.hint && (
          <p className="text-xs text-muted-foreground">{field.hint}</p>
        )}
      </div>
      {value.map((entry, i) => (
        <div
          key={i}
          className="@container rounded-lg border border-border bg-background/40 p-3"
        >
          <div className="mb-2 flex items-center gap-1">
            <p className="flex-1 text-xs font-medium text-muted-foreground capitalize">
              {noun} {i + 1}
            </p>
            <IconButton
              label="Move up"
              className="size-7"
              disabled={i === 0}
              onClick={() => move(i, -1)}
            >
              <ArrowUp />
            </IconButton>
            <IconButton
              label="Move down"
              className="size-7"
              disabled={i === value.length - 1}
              onClick={() => move(i, 1)}
            >
              <ArrowDown />
            </IconButton>
            <IconButton
              label={`Remove ${noun}`}
              tone="danger"
              className="size-7"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
            >
              <Trash2 />
            </IconButton>
          </div>
          <SchemaForm
            compact
            fields={field.fields}
            value={entry}
            onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-fit"
        onClick={() => onChange([...value, {}])}
      >
        <Plus /> Add {noun}
      </Button>
    </div>
  );
}
