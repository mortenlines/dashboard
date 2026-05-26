"use client";

import type { CardConfigFormProps } from "@/cards/types";
import type { StockConfig } from "./StockCard";

const INTERVAL_OPTIONS: { seconds: number; label: string }[] = [
  { seconds: 30, label: "Hvert 30. sekund" },
  { seconds: 60, label: "Hvert minutt" },
  { seconds: 120, label: "Hvert 2. minutt" },
  { seconds: 300, label: "Hvert 5. minutt" },
  { seconds: 600, label: "Hvert 10. minutt" },
  { seconds: 1800, label: "Hvert 30. minutt" },
  { seconds: 3600, label: "Hver time" },
];

export function StockConfigForm({
  value,
  onChange,
}: CardConfigFormProps<StockConfig>) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted">Tickersymbol</span>
        <input
          type="text"
          value={value.symbol}
          onChange={(e) =>
            onChange({ ...value, symbol: e.target.value.toUpperCase() })
          }
          maxLength={12}
          placeholder="e.g. ARM, AAPL, NVDA"
          className="w-full bg-transparent border border-border focus:border-border-hover focus:outline-none text-sm text-text placeholder:text-subtle uppercase tracking-wide rounded-lg px-3 py-2 transition-colors font-mono"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
        />
        <span className="text-[11px] text-subtle">
          Tickeren sjekkes mot Finnhub når du lagrer.
        </span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted">Oppdateringsintervall</span>
        <select
          value={value.updateIntervalSeconds}
          onChange={(e) =>
            onChange({
              ...value,
              updateIntervalSeconds: Number(e.target.value),
            })
          }
          className="w-full bg-surface border border-border focus:border-border-hover focus:outline-none text-sm text-text rounded-lg px-3 py-2 transition-colors"
        >
          {INTERVAL_OPTIONS.map((opt) => (
            <option key={opt.seconds} value={opt.seconds}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="text-[11px] text-subtle">
          Minimum 30 sekunder – grensen som lar 30 tickerkort holde seg innenfor
          Finnhubs gratis 60-forespørsler-per-minutt-nivå.
        </span>
      </label>
    </div>
  );
}
