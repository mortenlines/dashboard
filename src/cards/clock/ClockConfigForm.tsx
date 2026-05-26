"use client";

import type { CardConfigFormProps } from "@/cards/types";
import { COMMON_TIMEZONES } from "./timezones";
import type { ClockConfig } from "./ClockCard";

export function ClockConfigForm({
  value,
  onChange,
}: CardConfigFormProps<ClockConfig>) {
  return (
    <div className="flex flex-col gap-4">
      <Field label="Etikett">
        <input
          type="text"
          value={value.label}
          maxLength={30}
          onChange={(e) => onChange({ ...value, label: e.target.value })}
          placeholder="f.eks. Kontor, Hjem, Tokyo"
          className="w-full bg-transparent border border-border focus:border-border-hover focus:outline-none text-sm text-text placeholder:text-subtle rounded-lg px-3 py-2 transition-colors"
        />
      </Field>
      <Field label="Tidssone">
        <select
          value={value.timezone}
          onChange={(e) => onChange({ ...value, timezone: e.target.value })}
          className="w-full bg-surface border border-border focus:border-border-hover focus:outline-none text-sm text-text rounded-lg px-3 py-2 transition-colors"
        >
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz.value || "local"} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
