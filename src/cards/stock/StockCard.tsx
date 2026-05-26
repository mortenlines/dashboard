"use client";

import { useEffect, useRef, useState } from "react";
import { formatTimeOfDay, formatUsd } from "@/lib/format";
import type { CardComponentProps } from "@/cards/types";

export type StockConfig = {
  symbol: string;
  /** Polling interval in seconds. Minimum 30 (enforced both here and in the form). */
  updateIntervalSeconds: number;
};

export type Quote = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  fetchedAt: number;
};

const MIN_INTERVAL = 30;

export function StockCard({ config }: CardComponentProps<StockConfig>) {
  const interval = Math.max(MIN_INTERVAL, config.updateIntervalSeconds || 60);
  const symbol = (config.symbol || "").trim().toUpperCase();

  // The latest successful quote. Kept across refetches so the UI never
  // flashes empty — the "stale-while-revalidate" requirement.
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Used to abort an in-flight request when the symbol/interval changes
  // or the card unmounts.
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!symbol) {
      setQuote(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchQuote = async () => {
      // Abort any previous request still in flight.
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setIsRefreshing(true);
      try {
        const res = await fetch(
          `/api/stock?symbol=${encodeURIComponent(symbol)}`,
          { signal: ac.signal, cache: "no-store" }
        );
        const body = (await res.json().catch(() => ({}))) as
          | Quote
          | { error: string };

        if (!res.ok) {
          throw new Error(
            "error" in body ? body.error : `HTTP ${res.status}`
          );
        }
        if (cancelled) return;
        setQuote(body as Quote);
        setError(null);
      } catch (err) {
        if (cancelled || ac.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Henting mislyktes");
        // Intentionally keep the stale quote in state.
      } finally {
        if (!cancelled) setIsRefreshing(false);
      }
    };

    fetchQuote();
    const id = window.setInterval(fetchQuote, interval * 1000);
    return () => {
      cancelled = true;
      abortRef.current?.abort();
      window.clearInterval(id);
    };
  }, [symbol, interval]);

  if (!symbol) {
    return (
      <div className="text-sm text-muted">
        Åpne kortets editor og legg til et tickersymbol.
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-sm text-muted">
        {error ? (
          <span className="text-negative">{error}</span>
        ) : (
          "Henter…"
        )}
      </div>
    );
  }

  const isUp = quote.change >= 0;
  const sign = isUp ? "+" : "";
  const arrow = isUp ? "▲" : "▼";

  return (
    <>
      <div className="text-3xl font-medium tabular-nums text-text leading-none">
        {formatUsd(quote.price)}
      </div>
      <div
        className={`text-sm tabular-nums ${
          isUp ? "text-positive" : "text-negative"
        }`}
      >
        <span aria-hidden className="mr-1">
          {arrow}
        </span>
        {sign}
        {quote.change.toFixed(2)} ({sign}
        {quote.changePercent.toFixed(2)}%)
      </div>
      <div className="mt-1 flex items-center gap-2 text-[11px] text-subtle tabular-nums">
        <span suppressHydrationWarning>
          Oppdatert {formatTimeOfDay(new Date(quote.fetchedAt))}
        </span>
        {isRefreshing ? (
          <span aria-hidden className="inline-block w-1 h-1 rounded-full bg-accent animate-pulse" />
        ) : null}
        {error ? (
          <span className="text-negative">· oppdatering feilet</span>
        ) : null}
      </div>
    </>
  );
}
