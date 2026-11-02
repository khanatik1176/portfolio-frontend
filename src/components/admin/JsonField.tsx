"use client";

import { Braces, CircleAlert, CircleCheck } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import type { Json } from "@/lib/types";
import { inputClass } from "./ui";

/** Raw JSON editor for the free-form `content` / `data` fields. Remount with a new `key` to reset its text. */
export function JsonField({
  label,
  hint,
  value,
  onChange,
  rows = 8,
}: {
  label: string;
  hint?: string;
  value: Json;
  onChange: (value: Json) => void;
  rows?: number;
}) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [invalid, setInvalid] = useState(false);

  const update = (next: string) => {
    setText(next);
    try {
      onChange(JSON.parse(next || "{}"));
      setInvalid(false);
    } catch {
      setInvalid(true);
    }
  };

  return (
    <div className="grid gap-1.5 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-foreground/85">{label}</span>
        <div className="flex items-center gap-3 text-xs">
          {invalid ? (
            <span className="flex items-center gap-1 text-destructive">
              <CircleAlert className="size-3.5" /> Invalid JSON, not applied
            </span>
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground">
              <CircleCheck className="size-3.5 text-chart-3" /> Valid
            </span>
          )}
          <button
            type="button"
            disabled={invalid}
            onClick={() =>
              setText(JSON.stringify(JSON.parse(text || "{}"), null, 2))
            }
            className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <Braces className="size-3.5" /> Format
          </button>
        </div>
      </div>
      <textarea
        aria-label={label}
        rows={rows}
        spellCheck={false}
        value={text}
        onChange={(e) => update(e.target.value)}
        onKeyDown={(e) => {
          // Tab indents instead of leaving the field.
          if (e.key !== "Tab" || e.shiftKey) return;
          e.preventDefault();
          const el = e.currentTarget;
          const { selectionStart: a, selectionEnd: b } = el;
          update(text.slice(0, a) + "  " + text.slice(b));
          requestAnimationFrame(() => el.setSelectionRange(a + 2, a + 2));
        }}
        className={clsx(
          inputClass,
          "resize-y font-mono text-xs leading-relaxed",
          invalid && "border-destructive focus:border-destructive",
        )}
      />
      {hint && (
        <span className="text-xs leading-relaxed text-muted-foreground">
          {hint}
        </span>
      )}
    </div>
  );
}
