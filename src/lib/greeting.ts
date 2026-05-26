/**
 * Compute the time-of-day prefix for a greeting (e.g. "Good morning").
 * Uses the local hour of the supplied date.
 */
export function getTimeOfDayGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 5) return "Jobber sent";
  if (hour < 12) return "God morgen";
  if (hour < 18) return "God ettermiddag";
  if (hour < 20) return "Six-seven";
  if (hour < 22) return "God kveill";
  return "God natt";
}

/** Composes "God kveld, Morten" — or a graceful fallback when no name is known. */
export function composeGreeting(date: Date, name: string | null): string {
  const prefix = getTimeOfDayGreeting(date);
  if (!name) return `${prefix}.`;
  return `${prefix}, ${name}.`;
}
