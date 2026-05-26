"use client";

import type { CardConfigFormProps } from "@/cards/types";
import type { YearProgressConfig } from "./YearProgressCard";

const TOGGLES: { key: keyof YearProgressConfig; label: string; help: string }[] = [
  { key: "showMonths", label: "Måneder fullført", help: "Hele måneder fullført (0–12)" },
  { key: "showDays", label: "Dager fullført", help: "Hele dager siden 1. jan" },
  { key: "showHours", label: "Timer fullført", help: "Hele timer siden 1. jan" },
];

export function YearProgressConfigForm({
  value,
  onChange,
}: CardConfigFormProps<YearProgressConfig>) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="text-xs font-medium text-muted mb-1">
        Tilleggsdata å vise
      </legend>
      {TOGGLES.map((t) => (
        <label
          key={t.key}
          className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-border-hover transition-colors cursor-pointer"
        >
          <input
            type="checkbox"
            checked={value[t.key]}
            onChange={(e) =>
              onChange({ ...value, [t.key]: e.target.checked })
            }
            className="mt-0.5 accent-accent"
          />
          <span className="flex flex-col gap-0.5">
            <span className="text-sm text-text">{t.label}</span>
            <span className="text-xs text-muted">{t.help}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
