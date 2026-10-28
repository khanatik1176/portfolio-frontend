"use client";

import { useState } from "react";
import type { Json } from "@/lib/types";
import { Field, inputClass } from "./ui";

/** Raw JSON editor for the free-form `content` / `data` fields. */
export function JsonField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Json;
  onChange: (value: Json) => void;
}) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [invalid, setInvalid] = useState(false);

  return (
    <Field label={label}>
      <textarea
        rows={5}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          try {
            onChange(JSON.parse(e.target.value || "{}"));
            setInvalid(false);
          } catch {
            setInvalid(true);
          }
        }}
        className={`${inputClass} font-mono text-xs ${invalid ? "border-red-500" : ""}`}
      />
      {invalid && <span className="text-xs text-red-600">Invalid JSON, not saved</span>}
    </Field>
  );
}
