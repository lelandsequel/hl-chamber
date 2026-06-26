"use client";

import type { ChannelField } from "@/lib/chamber/channels";

const fieldClass =
  "mt-1 w-full rounded border border-border bg-black/30 px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none";
const labelClass = "font-mono text-xs uppercase text-muted";

type Props = {
  fields: ChannelField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  disabled?: boolean;
};

export function FieldForm({ fields, values, onChange, disabled }: Props) {
  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <div key={f.key}>
          <label className={labelClass}>
            {f.label}
            {f.required ? " *" : ""}
          </label>
          {f.kind === "textarea" ? (
            <textarea
              disabled={disabled}
              required={f.required}
              rows={3}
              className={fieldClass}
              placeholder={f.placeholder}
              value={values[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
            />
          ) : f.kind === "select" ? (
            <select
              disabled={disabled}
              required={f.required}
              className={fieldClass}
              value={values[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
            >
              {(f.options ?? []).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              disabled={disabled}
              required={f.required}
              type={f.kind === "number" ? "number" : f.kind === "date" ? "date" : f.kind === "email" ? "email" : "text"}
              className={fieldClass}
              placeholder={f.placeholder}
              value={values[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}