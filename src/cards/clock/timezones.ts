/** Curated list of common IANA timezones shown in the clock config form. */
export const COMMON_TIMEZONES: readonly { value: string; label: string }[] = [
  { value: "", label: "Local (browser timezone)" },
  { value: "Pacific/Honolulu", label: "Honolulu" },
  { value: "America/Anchorage", label: "Anchorage" },
  { value: "America/Los_Angeles", label: "Los Angeles" },
  { value: "America/Denver", label: "Denver" },
  { value: "America/Chicago", label: "Chicago" },
  { value: "America/New_York", label: "New York" },
  { value: "America/Toronto", label: "Toronto" },
  { value: "America/Sao_Paulo", label: "São Paulo" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Europe/Madrid", label: "Madrid" },
  { value: "Europe/Athens", label: "Athens" },
  { value: "Europe/Moscow", label: "Moscow" },
  { value: "Africa/Lagos", label: "Lagos" },
  { value: "Africa/Cairo", label: "Cairo" },
  { value: "Africa/Johannesburg", label: "Johannesburg" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Kolkata", label: "Mumbai / Kolkata" },
  { value: "Asia/Bangkok", label: "Bangkok" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Hong_Kong", label: "Hong Kong" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Seoul", label: "Seoul" },
  { value: "Australia/Perth", label: "Perth" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "Pacific/Auckland", label: "Auckland" },
];

export function findTimezoneLabel(value: string): string {
  const match = COMMON_TIMEZONES.find((t) => t.value === value);
  return match ? match.label : value;
}
