import { NextResponse } from "next/server";

/**
 * GET /api/stock?symbol=ARM
 *
 * Proxies Finnhub's /quote endpoint so the API key stays on the server.
 * A small in-memory cache de-duplicates concurrent requests for the same
 * ticker within a short window — important when many stock cards poll on
 * the same interval. (Note: on Vercel serverless this cache is per-instance,
 * so it doesn't replace a real cache like Redis, but it still helps in dev
 * and for hot, sticky instances.)
 */

type QuoteResponse = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  fetchedAt: number;
};

type FinnhubQuote = {
  c: number;
  d: number;
  dp: number;
  pc: number;
};

const CACHE_TTL_MS = 15_000;
const cache = new Map<string, { value: QuoteResponse; expires: number }>();

export const dynamic = "force-dynamic"; // never cached by Next's data cache

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("symbol");
  if (!raw) {
    return NextResponse.json(
      { error: "Missing `symbol` query parameter." },
      { status: 400 }
    );
  }

  const symbol = raw.trim().toUpperCase();
  if (!/^[A-Z0-9.\-]{1,12}$/.test(symbol)) {
    return NextResponse.json(
      { error: "Invalid symbol format." },
      { status: 400 }
    );
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "FINNHUB_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  // Cache hit?
  const now = Date.now();
  const cached = cache.get(symbol);
  if (cached && cached.expires > now) {
    return NextResponse.json(cached.value);
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
      { headers: { Accept: "application/json" }, cache: "no-store" }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: `Network error reaching Finnhub: ${
          err instanceof Error ? err.message : "unknown"
        }`,
      },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    const body = await upstream.text().catch(() => "");
    return NextResponse.json(
      {
        error: `Finnhub responded ${upstream.status} ${upstream.statusText}${
          body ? `: ${body.slice(0, 200)}` : ""
        }`,
      },
      { status: upstream.status }
    );
  }

  const data = (await upstream.json()) as FinnhubQuote;
  if (!data.c) {
    return NextResponse.json(
      { error: `No price data for ${symbol}.` },
      { status: 404 }
    );
  }

  const response: QuoteResponse = {
    symbol,
    price: data.c,
    change: data.d,
    changePercent: data.dp,
    previousClose: data.pc,
    fetchedAt: now,
  };

  cache.set(symbol, { value: response, expires: now + CACHE_TTL_MS });
  return NextResponse.json(response);
}
