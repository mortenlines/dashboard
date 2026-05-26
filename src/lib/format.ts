/** Time-of-day with seconds, e.g. "14:03:27". */
export function formatTimeOfDay(date: Date, timezone?: string): string {
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

/** Time-of-day without seconds, e.g. "14:03". */
export function formatHourMinute(date: Date, timezone?: string): string {
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** USD currency, two decimals. */
export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
