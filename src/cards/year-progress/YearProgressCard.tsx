"use client";

import { useEffect, useState } from "react";
import type { CardComponentProps } from "@/cards/types";

export type YearProgressConfig = {
  showDays: boolean;
  showHours: boolean;
  showMonths: boolean;
};

type Snapshot = {
  year: number;
  progress: number; // 0..1
  daysElapsed: number;
  daysInYear: number;
  hoursElapsed: number;
  hoursInYear: number;
  monthsElapsed: number;
};

const MS_PER_DAY = 86_400_000;
const MS_PER_HOUR = 3_600_000;

function snapshot(now: Date): Snapshot {
  const year = now.getFullYear();
  const start = new Date(year, 0, 1).getTime();
  const end = new Date(year + 1, 0, 1).getTime();
  const totalMs = end - start;
  const elapsedMs = now.getTime() - start;

  return {
    year,
    progress: elapsedMs / totalMs,
    daysElapsed: Math.floor(elapsedMs / MS_PER_DAY),
    daysInYear: Math.floor(totalMs / MS_PER_DAY),
    hoursElapsed: Math.floor(elapsedMs / MS_PER_HOUR),
    hoursInYear: Math.floor(totalMs / MS_PER_HOUR),
    monthsElapsed: now.getMonth(), // 0..11 = months fully completed
  };
}

export function YearProgressCard({ config }: CardComponentProps<YearProgressConfig>) {
  const [data, setData] = useState<Snapshot | null>(null);

  useEffect(() => {
    const tick = () => setData(snapshot(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const pct = data ? data.progress * 100 : 0;
  const pctLabel = data ? `${pct.toFixed(1)}%` : "—";
  const yearLabel = data?.year ?? new Date().getFullYear();

  const anyExtra =
    config.showDays || config.showHours || config.showMonths;

  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span
          className="text-3xl font-medium tabular-nums text-text"
          suppressHydrationWarning
        >
          {pctLabel}
        </span>
        <span className="text-xs text-subtle">av {yearLabel}</span>
      </div>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label={`${yearLabel} årsframgang`}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {anyExtra && data ? (
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-muted">
          {config.showMonths ? (
            <Metric label="Måneder" value={`${data.monthsElapsed} av 12`} />
          ) : null}
          {config.showDays ? (
            <Metric
              label="Dager"
              value={`${data.daysElapsed.toLocaleString()} av ${data.daysInYear.toLocaleString()}`}
            />
          ) : null}
          {config.showHours ? (
            <Metric
              label="Timer"
              value={`${data.hoursElapsed.toLocaleString()} av ${data.hoursInYear.toLocaleString()}`}
            />
          ) : null}
        </dl>
      ) : null}
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-subtle">{label}</dt>
      <dd className="text-text tabular-nums">{value}</dd>
    </>
  );
}
