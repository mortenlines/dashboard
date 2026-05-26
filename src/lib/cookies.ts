import "server-only";
import { cookies } from "next/headers";
import { COOKIE_KEYS, type Theme } from "./cookie-keys";

/** Read the user's stored theme. Returns null when no explicit choice has been made. */
export async function getStoredTheme(): Promise<Theme | null> {
  const store = await cookies();
  const value = store.get(COOKIE_KEYS.theme)?.value;
  return value === "light" || value === "dark" ? value : null;
}

/** Read the user's stored display name. */
export async function getStoredName(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(COOKIE_KEYS.name)?.value?.trim();
  return value ? value : null;
}
