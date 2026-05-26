"use client";

import { useEffect, useState } from "react";
import { formatHourMinute } from "@/lib/format";
import type { CardComponentProps } from "@/cards/types";

export type ClockConfig = {
  label: string;
  /** IANA timezone. Empty string = use the browser's local timezone. */
  timezone: string;
};

export function ClockCard({ config, size }: CardComponentProps<ClockConfig>) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tz = config.timezone || undefined;
    const tick = () => setTime(formatHourMinute(new Date(), tz));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [config.timezone]);

  const isHero = size !== "sm";

  return (
    <>
      <div
        className={`font-mono tabular-nums text-text leading-none ${
          isHero ? "text-5xl sm:text-6xl" : "text-3xl"
        }`}
        suppressHydrationWarning
      >
        {time ?? "——:——"}
      </div>
    </>
  );
}
