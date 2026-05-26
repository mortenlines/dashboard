"use client";

import type { CardConfigFormProps } from "@/cards/types";
import { normalizeWeatherConfig, type WeatherConfig } from "./WeatherCard";

const TOGGLES: { key: keyof WeatherConfig; label: string; help: string }[] = [
  {
    key: "showFeelsLike",
    label: "Føles som",
    help: "Tilsynelatende temperatur tatt hensyn til vind og luftfuktighet",
  },
  {
    key: "showWind",
    label: "Vind",
    help: "Nåværende vindhastighet og retning",
  },
  {
    key: "showRain",
    label: "Regn",
    help: "Nedbør siste time",
  },
  {
    key: "showUv",
    label: "UV-indeks",
    help: "Nåværende ultrafioletnivå",
  },
];

export function WeatherConfigForm({
  value,
  onChange,
}: CardConfigFormProps<WeatherConfig>) {
  // Cards saved before the toggles existed have keys missing from `value`.
  // Normalising here keeps the checkboxes controlled from the very first render
  // and ensures any change we emit upward writes back complete, well-typed config.
  const normalized = normalizeWeatherConfig(value);

  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="text-xs font-medium text-muted mb-1">
        Statistikk å vise
      </legend>
      {TOGGLES.map((t) => (
        <label
          key={t.key}
          className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-border-hover transition-colors cursor-pointer"
        >
          <input
            type="checkbox"
            checked={normalized[t.key]}
            onChange={(e) =>
              onChange({ ...normalized, [t.key]: e.target.checked })
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
