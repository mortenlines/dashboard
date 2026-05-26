// Plain constants/types — importable from both server and client code.
// (Splitting this out of cookies.ts keeps `next/headers` out of client bundles.)

export type Theme = "light" | "dark";

export const COOKIE_KEYS = {
  theme: "theme",
  name: "name",
} as const;
