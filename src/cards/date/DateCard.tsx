"use client";

import { useEffect, useState } from "react";
import type { CardComponentProps } from "@/cards/types";

export type DateConfig = Record<string, never>;

type Parts = { weekday: string; day: string; month: string };

function getParts(now: Date): Parts {
  return {
    weekday: new Intl.DateTimeFormat("nb-NO", { weekday: "long" }).format(now),
    day: new Intl.DateTimeFormat("nb-NO", { day: "numeric" }).format(now),
    month: new Intl.DateTimeFormat("nb-NO", { month: "long" }).format(now),
  };
}

export function DateCard(_: CardComponentProps<DateConfig>) {
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const tick = () => setParts(getParts(new Date()));
    tick();
    // Every minute is enough to catch a midnight rollover.
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <div
        className="text-3xl font-medium text-text leading-none"
        suppressHydrationWarning
      >
        {parts?.weekday ?? "—"}
      </div>
      <div className="text-sm text-muted" suppressHydrationWarning>
        {parts ? `${parts.day} ${parts.month}` : "—"}
      </div>
    </>
  );
}
