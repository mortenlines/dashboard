import { NextResponse } from "next/server";

/**
 * GET /api/weather?lat=59.91&lon=10.75
 *
 * Proxies the Norwegian Meteorological Institute's free weather API. yr.no
 * requires a descriptive User-Agent identifying the application; setting one
 * from the browser isn't reliable, so all calls flow through this route.
 *
 * Response is normalized into something the card can render directly:
 *   {
 *     current: { temp, symbolCode, feelsLike, windSpeed, windDirection, rain, uvi },
 *     daily:   [ { date, tempMin, tempMax, symbolCode } ]
 *   }
 *
 * Server-side cache (in-memory, per instance) keeps multiple cards or users
 * pointed at the same coordinates within yr.no's per-hour rate guidance.
 */

const USER_AGENT = "startpage/1.0 (https://github.com/lines/startpage)";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export type WeatherResponse = {
  current: {
    temp: number;
    symbolCode: string;
    /** Apparent temperature in °C (Australian BOM formula). */
    feelsLike: number;
    /** Wind speed in m/s. */
    windSpeed: number;
    /** Wind direction in degrees, 0 = N, clockwise. */
    windDirection: number;
    /** Precipitation in mm for the next 1 h (falls back to next 6 h if unavailable). */
    rain: number;
    /** UV index (clear-sky estimate from met.no). */
    uvi: number;
  };
  daily: { date: string; tempMin: number; tempMax: number; symbolCode: string }[];
  /** Unix ms when this payload was produced (used for the card's "Updated" label). */
  fetchedAt: number;
};

type Timeseries = {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature?: number;
        wind_speed?: number;
        wind_from_direction?: number;
        relative_humidity?: number;
        ultraviolet_index_clear_sky?: number;
      };
    };
    next_1_hours?: {
      summary: { symbol_code: string };
      details?: { precipitation_amount?: number };
    };
    next_6_hours?: {
      summary: { symbol_code: string };
      details: {
        air_temperature_max?: number;
        air_temperature_min?: number;
        precipitation_amount?: number;
      };
    };
    next_12_hours?: { summary: { symbol_code: string } };
  };
};

type Forecast = {
  properties: { timeseries: Timeseries[] };
};

const cache = new Map<string, { value: WeatherResponse; expires: number }>();

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { error: "Provide numeric `lat` and `lon` query parameters." },
      { status: 400 }
    );
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json(
      { error: "Latitude or longitude out of range." },
      { status: 400 }
    );
  }

  // yr.no recommends rounding to 4 decimal places. Rounding to 2 (~1km)
  // also makes the cache hit rate much better.
  const roundedLat = Math.round(lat * 100) / 100;
  const roundedLon = Math.round(lon * 100) / 100;
  const cacheKey = `${roundedLat},${roundedLon}`;

  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > now) {
    return NextResponse.json(cached.value);
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${roundedLat}&lon=${roundedLon}`,
      {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: `Network error reaching met.no: ${
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
        error: `met.no responded ${upstream.status} ${upstream.statusText}${
          body ? `: ${body.slice(0, 200)}` : ""
        }`,
      },
      { status: upstream.status }
    );
  }

  const data = (await upstream.json()) as Forecast;
  const series = data.properties.timeseries;
  if (!series || series.length === 0) {
    return NextResponse.json(
      { error: "Forecast contained no timeseries data." },
      { status: 502 }
    );
  }

  const response: WeatherResponse = {
    current: buildCurrent(series),
    daily: buildDaily(series),
    fetchedAt: now,
  };

  cache.set(cacheKey, { value: response, expires: now + CACHE_TTL_MS });
  return NextResponse.json(response);
}

/**
 * Apparent temperature using the Australian Bureau of Meteorology formula:
 *   AT = T + 0.33·e − 0.70·ws − 4.00
 * where e is vapour pressure (hPa) derived from relative humidity.
 * Falls back to actual temperature when humidity is unavailable.
 */
function apparentTemperature(tempC: number, windSpeedMs: number, relativeHumidity: number | undefined): number {
  if (relativeHumidity == null || !Number.isFinite(relativeHumidity)) return tempC;
  const e = (relativeHumidity / 100) * 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC));
  return tempC + 0.33 * e - 0.70 * windSpeedMs - 4.0;
}

function buildCurrent(series: Timeseries[]): WeatherResponse["current"] {
  const first = series[0];
  const d = first.data.instant.details;

  const temp = d.air_temperature ?? NaN;
  const windSpeed = d.wind_speed ?? 0;
  const windDirection = d.wind_from_direction ?? 0;
  const uvi = d.ultraviolet_index_clear_sky ?? 0;
  const rain =
    first.data.next_1_hours?.details?.precipitation_amount ??
    first.data.next_6_hours?.details?.precipitation_amount ??
    0;

  return {
    temp,
    symbolCode:
      first.data.next_1_hours?.summary.symbol_code ??
      first.data.next_6_hours?.summary.symbol_code ??
      first.data.next_12_hours?.summary.symbol_code ??
      "cloudy",
    feelsLike: apparentTemperature(temp, windSpeed, d.relative_humidity),
    windSpeed,
    windDirection,
    rain,
    uvi,
  };
}

/**
 * Build a 2-day forecast (tomorrow + day after). We pick the noon entry of
 * each future day for the symbol_code (next_12_hours covers noon → midnight,
 * which is the best single representative for "what's the day like?") and
 * scan all entries in that day for actual min/max temps.
 */
function buildDaily(series: Timeseries[]): WeatherResponse["daily"] {
  // Group entries by ISO date (UTC). yr.no times are ISO-8601 in UTC.
  const groups = new Map<string, Timeseries[]>();
  for (const entry of series) {
    const date = entry.time.slice(0, 10);
    const bucket = groups.get(date) ?? [];
    bucket.push(entry);
    groups.set(date, bucket);
  }

  const today = series[0].time.slice(0, 10);
  const futureDays = Array.from(groups.keys())
    .filter((d) => d > today)
    .slice(0, 2);

  return futureDays.map((date) => {
    const entries = groups.get(date)!;
    let tempMin = Infinity;
    let tempMax = -Infinity;
    for (const e of entries) {
      const t = e.data.instant.details.air_temperature;
      if (typeof t === "number") {
        if (t < tempMin) tempMin = t;
        if (t > tempMax) tempMax = t;
      }
    }
    // Symbol: prefer the noon entry's next_12_hours summary.
    const noonish =
      entries.find((e) => e.time.includes("T12:")) ?? entries[0];
    const symbolCode =
      noonish.data.next_12_hours?.summary.symbol_code ??
      noonish.data.next_6_hours?.summary.symbol_code ??
      noonish.data.next_1_hours?.summary.symbol_code ??
      "cloudy";
    return {
      date,
      tempMin: tempMin === Infinity ? NaN : tempMin,
      tempMax: tempMax === -Infinity ? NaN : tempMax,
      symbolCode,
    };
  });
}
