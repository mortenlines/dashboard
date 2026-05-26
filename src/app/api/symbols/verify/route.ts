import { NextResponse } from "next/server";

/**
 * GET /api/symbols/verify?symbol=ARM
 *
 * Uses Finnhub's symbol-lookup endpoint to confirm a ticker exists. Used by
 * the stock card's config form before allowing the card to be saved.
 *
 * Returns:
 *   { ok: true,  symbol, description }   — verified
 *   { ok: false, message }                — not found / error
 */

type FinnhubMatch = {
  symbol: string;
  description: string;
  displaySymbol: string;
  type: string;
};

type FinnhubSearch = {
  count: number;
  result: FinnhubMatch[];
};

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("symbol");
  if (!raw) {
    return NextResponse.json(
      { ok: false, message: "Missing symbol." },
      { status: 400 }
    );
  }

  const symbol = raw.trim().toUpperCase();
  if (!/^[A-Z0-9.\-]{1,12}$/.test(symbol)) {
    return NextResponse.json({
      ok: false,
      message: "Symbols use letters, digits, '.' or '-' (max 12 chars).",
    });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        message: "FINNHUB_API_KEY is not configured on the server.",
      },
      { status: 500 }
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(symbol)}&token=${apiKey}`,
      { headers: { Accept: "application/json" }, cache: "no-store" }
    );
  } catch (err) {
    return NextResponse.json({
      ok: false,
      message: `Network error: ${
        err instanceof Error ? err.message : "unknown"
      }`,
    });
  }

  if (!upstream.ok) {
    return NextResponse.json({
      ok: false,
      message: `Finnhub responded ${upstream.status} ${upstream.statusText}.`,
    });
  }

  const data = (await upstream.json()) as FinnhubSearch;

  // Look for an exact symbol match. Some Finnhub entries include exchange
  // suffixes (e.g. "ARM.US") — accept those too as long as the prefix matches.
  const exact = data.result?.find(
    (r) => r.symbol === symbol || r.symbol.split(".")[0] === symbol
  );

  if (exact) {
    return NextResponse.json({
      ok: true,
      symbol,
      description: exact.description,
    });
  }

  return NextResponse.json({
    ok: false,
    message: `No ticker named "${symbol}" found.`,
  });
}
