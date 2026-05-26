"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CardInstance, CardSize } from "@/cards/types";

const STORAGE_KEY = "startpage:layout:v1";

type NewCard = Omit<CardInstance, "id">;

type LayoutContextValue = {
  /** Current ordered list of cards. */
  cards: CardInstance[];
  /** True once we've finished reading from localStorage (avoid flash of wrong state). */
  hydrated: boolean;

  addCard: (card: NewCard) => string;
  removeCard: (id: string) => void;
  updateCard: (id: string, patch: Partial<Omit<CardInstance, "id" | "type">>) => void;

  /** Move a card by index delta — used by the up/down arrow buttons. */
  moveBy: (id: string, delta: -1 | 1) => void;
  /** Reorder via drag-and-drop. Takes the ids of the active and over items. */
  reorder: (activeId: string, overId: string) => void;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

function safeReadLayout(): CardInstance[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CardInstance[]) : [];
  } catch {
    return [];
  }
}

function safeWriteLayout(cards: CardInstance[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // Quota exceeded or storage disabled — silently ignore. State stays in memory.
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `c_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = items.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<CardInstance[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Read once on mount.
  useEffect(() => {
    setCards(safeReadLayout());
    setHydrated(true);
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!hydrated) return;
    safeWriteLayout(cards);
  }, [cards, hydrated]);

  const addCard = useCallback<LayoutContextValue["addCard"]>((card) => {
    const id = newId();
    setCards((prev) => [...prev, { ...card, id }]);
    return id;
  }, []);

  const removeCard = useCallback<LayoutContextValue["removeCard"]>((id) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateCard = useCallback<LayoutContextValue["updateCard"]>((id, patch) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              size: (patch.size ?? c.size) as CardSize,
              config: patch.config !== undefined ? patch.config : c.config,
            }
          : c
      )
    );
  }, []);

  const moveBy = useCallback<LayoutContextValue["moveBy"]>((id, delta) => {
    setCards((prev) => {
      const from = prev.findIndex((c) => c.id === id);
      if (from < 0) return prev;
      const to = from + delta;
      if (to < 0 || to >= prev.length) return prev;
      return moveItem(prev, from, to);
    });
  }, []);

  const reorder = useCallback<LayoutContextValue["reorder"]>((activeId, overId) => {
    if (activeId === overId) return;
    setCards((prev) => {
      const from = prev.findIndex((c) => c.id === activeId);
      const to = prev.findIndex((c) => c.id === overId);
      if (from < 0 || to < 0) return prev;
      return moveItem(prev, from, to);
    });
  }, []);

  const value = useMemo<LayoutContextValue>(
    () => ({ cards, hydrated, addCard, removeCard, updateCard, moveBy, reorder }),
    [cards, hydrated, addCard, removeCard, updateCard, moveBy, reorder]
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useLayout(): LayoutContextValue {
  const ctx = useContext(LayoutContext);
  if (!ctx) {
    throw new Error("useLayout must be used inside a <LayoutProvider />");
  }
  return ctx;
}
