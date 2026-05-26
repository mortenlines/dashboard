"use client";

import { useEffect, useState, type FormEvent } from "react";
import { composeGreeting } from "@/lib/greeting";
import { COOKIE_KEYS } from "@/lib/cookie-keys";

type Props = {
  initialName: string | null;
};

const YEAR = 60 * 60 * 24 * 365;

function setNameCookie(name: string) {
  document.cookie = `${COOKIE_KEYS.name}=${encodeURIComponent(name)}; path=/; max-age=${YEAR}; samesite=lax`;
}

export function Greeting({ initialName }: Props) {
  const [name, setName] = useState<string | null>(initialName);
  const [editing, setEditing] = useState<boolean>(initialName === null);
  const [draft, setDraft] = useState<string>(initialName ?? "");

  // Greeting text — render a generic version on first paint to avoid hydration
  // mismatch, then refine to a time-of-day greeting in the user's local timezone.
  const [greeting, setGreeting] = useState<string>(
    initialName ? `Hei, ${initialName}.` : "Hei."
  );

  useEffect(() => {
    const update = () => setGreeting(composeGreeting(new Date(), name));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [name]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    setName(trimmed);
    setNameCookie(trimmed);
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <h1
        className="text-2xl sm:text-3xl font-medium tracking-tight text-text"
        suppressHydrationWarning
      >
        {greeting}
      </h1>
      {editing ? (
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Hva skal jeg kalle deg?"
            autoFocus
            maxLength={40}
            className="bg-transparent border-b border-border focus:border-border-hover focus:outline-none text-sm text-text placeholder:text-subtle py-1 w-56 transition-colors"
          />
          <button
            type="submit"
            className="text-xs font-medium text-muted hover:text-text transition-colors"
          >
            Lagre
          </button>
          {initialName !== null ? (
            <button
              type="button"
              onClick={() => {
                setDraft(name ?? "");
                setEditing(false);
              }}
              className="text-xs text-subtle hover:text-muted transition-colors"
            >
              Avbryt
            </button>
          ) : null}
        </form>
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(name ?? "");
            setEditing(true);
          }}
          className="self-start text-xs text-subtle hover:text-muted transition-colors"
        >
          Endre navn
        </button>
      )}
    </div>
  );
}
