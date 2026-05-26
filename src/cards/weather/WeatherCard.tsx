"use client";

import { useEffect, useRef, useState } from "react";
import { formatTimeOfDay } from "@/lib/format";
import type { CardComponentProps, CardSize } from "@/cards/types";
import type { WeatherResponse } from "@/app/api/weather/route";
import { weatherIconFor, weatherLabelFor } from "./WeatherIcons";

export type WeatherConfig = {
  showFeelsLike: boolean;
  showWind: boolean;
  showRain: boolean;
  showUv: boolean;
};

export const DEFAULT_WEATHER_CONFIG: WeatherConfig = {
  showFeelsLike: true,
  showWind: true,
  showRain: true,
  showUv: true,
};

/**
 * Cards saved before stats became configurable have a `{}` config. Fall back
 * to the defaults so they keep rendering all four stats.
 */
export function normalizeWeatherConfig(
  config: Partial<WeatherConfig> | undefined
): WeatherConfig {
  return {
    showFeelsLike: config?.showFeelsLike ?? DEFAULT_WEATHER_CONFIG.showFeelsLike,
    showWind: config?.showWind ?? DEFAULT_WEATHER_CONFIG.showWind,
    showRain: config?.showRain ?? DEFAULT_WEATHER_CONFIG.showRain,
    showUv: config?.showUv ?? DEFAULT_WEATHER_CONFIG.showUv,
  };
}

type Coords = { lat: number; lon: number };

type Status =
  | { kind: "idle" }
  | { kind: "requesting-location" }
  | { kind: "fetching"; coords: Coords }
  | { kind: "ready"; coords: Coords; data: WeatherResponse }
  | { kind: "error"; message: string };

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

async function reverseGeocode(coords: Coords): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lon}&format=json`,
      { headers: { "Accept-Language": "nb" } }
    );
    const data = await res.json();
    return (
      data.address?.city ??
      data.address?.town ??
      data.address?.village ??
      data.address?.county ??
      null
    );
  } catch {
    return null;
  }
}

export function WeatherCard({
  size,
  config,
}: CardComponentProps<WeatherConfig>) {
  const normalized = normalizeWeatherConfig(config);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [refreshing, setRefreshing] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 1) Ask for location once on mount.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus({
        kind: "error",
        message: "Geolokasjon er ikke tilgjengelig i denne nettleseren.",
      });
      return;
    }

    setStatus({ kind: "requesting-location" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus({
          kind: "fetching",
          coords: { lat: pos.coords.latitude, lon: pos.coords.longitude },
        });
      },
      (err) => {
        setStatus({
          kind: "error",
          message:
            err.code === err.PERMISSION_DENIED
              ? "Tillatelse til posisjon ble avslått."
              : `Kunne ikke hente din posisjon: ${err.message}`,
        });
      },
      { timeout: 10_000, maximumAge: 5 * 60 * 1000 }
    );
  }, []);

  // 2) Once we have coords, reverse-geocode to get a human-readable location name.
  const coords = "coords" in status ? status.coords : null;

  useEffect(() => {
    if (!coords) return;
    let cancelled = false;
    reverseGeocode(coords).then((name) => {
      if (!cancelled) setLocationName(name);
    });
    return () => {
      cancelled = true;
    };
  }, [coords]);

  // 3) Once we have coords, fetch and refresh on an interval.

  useEffect(() => {
    if (!coords) return;

    let cancelled = false;

    const fetchWeather = async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setRefreshing(true);

      try {
        const res = await fetch(
          `/api/weather?lat=${coords.lat}&lon=${coords.lon}`,
          { signal: ac.signal, cache: "no-store" }
        );
        const body = (await res.json().catch(() => ({}))) as
          | WeatherResponse
          | { error: string };

        if (!res.ok) {
          throw new Error(
            "error" in body ? body.error : `HTTP ${res.status}`
          );
        }
        if (cancelled) return;
        setStatus({ kind: "ready", coords, data: body as WeatherResponse });
      } catch (err) {
        if (cancelled || ac.signal.aborted) return;
        setStatus((prev) => {
          // Keep showing the last successful data on a refresh failure.
          if (prev.kind === "ready") return prev;
          return {
            kind: "error",
            message:
              err instanceof Error ? err.message : "Kunne ikke hente vær.",
          };
        });
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    };

    fetchWeather();
    const id = window.setInterval(fetchWeather, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      abortRef.current?.abort();
      window.clearInterval(id);
    };
  }, [coords]);

  if (status.kind === "idle" || status.kind === "requesting-location") {
    return <div className="text-sm text-muted">Finner deg…</div>;
  }

  if (status.kind === "fetching") {
    return <div className="text-sm text-muted">Henter varsel…</div>;
  }

  if (status.kind === "error") {
    return (
      <div className="text-sm text-negative leading-relaxed">
        {status.message}
      </div>
    );
  }

  return (
    <WeatherContent
      data={status.data}
      coords={status.coords}
      locationName={locationName}
      size={size}
      config={normalized}
      refreshing={refreshing}
    />
  );
}

// ─── Presentation helpers ────────────────────────────────────────────────────

const CARDINAL_DIRS = ["N", "NØ", "E", "SØ", "S", "SW", "W", "NW"] as const;

function windCardinal(degrees: number): string {
  return CARDINAL_DIRS[Math.round(degrees / 45) % 8];
}

function uviLabel(uvi: number): string {
  if (uvi < 3) return "Lav";
  if (uvi < 6) return "Moderat";
  if (uvi < 8) return "Høy";
  if (uvi < 11) return "Svært høy";
  return "Ekstremt";
}

function StatsGrid({
  current,
  size,
  config,
}: {
  current: WeatherResponse["current"];
  size: CardSize;
  config: WeatherConfig;
}) {
  // Guard against stale cached responses that pre-date the new fields.
  const windSpeed = current.windSpeed ?? 0;
  const windDirection = current.windDirection ?? 0;
  const rain = current.rain ?? 0;
  const uvi = current.uvi ?? 0;
  const feelsLike = current.feelsLike ?? current.temp;

  // Building each stat alongside its enable-flag keeps the order stable and
  // makes it trivial to add or rename a stat later without touching the
  // rendering code.
  const allStats: { key: keyof WeatherConfig; label: string; value: string }[] = [
    {
      key: "showFeelsLike",
      label: "Føles som",
      value: `${Math.round(feelsLike)}°`,
    },
    {
      key: "showWind",
      label: "Vind",
      value: `${windSpeed.toFixed(1)} m/s ${windCardinal(windDirection)}`,
    },
    {
      key: "showRain",
      label: "Regn",
      value: `${rain.toFixed(1)} mm`,
    },
    {
      key: "showUv",
      label: `UV ${Math.round(uvi)}`,
      value: uviLabel(uvi),
    },
  ];

  const stats = allStats.filter((s) => config[s.key]);
  if (stats.length === 0) return null;

  // sm: stack vertically (the card is narrow).
  // md/lg: spread horizontally — justify-between distributes the available
  // width between the stats so they always have breathing room regardless of
  // how wide each individual label/value happens to be.
  const layoutClasses =
    size === "sm"
      ? "flex flex-col gap-2"
      : "flex flex-row flex-wrap justify-between gap-x-6 gap-y-3";

  return (
    <div className={`mt-3 pt-3 border-t border-border ${layoutClasses}`}>
      {stats.map(({ label, value }) => (
        <div key={label} className="flex flex-col gap-0.5">
          <span className="text-[10px] text-subtle uppercase tracking-wide leading-none">
            {label}
          </span>
          <span className="text-sm text-text tabular-nums">{value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── WeatherContent ───────────────────────────────────────────────────────────

function WeatherContent({
  data,
  coords,
  locationName,
  size,
  config,
  refreshing,
}: {
  data: WeatherResponse;
  coords: Coords;
  locationName: string | null;
  size: CardSize;
  config: WeatherConfig;
  refreshing: boolean;
}) {
  const CurrentIcon = weatherIconFor(data.current.symbolCode);
  const showForecast = size !== "sm";
  const yrUrl = `https://www.yr.no/en/forecast/daily-table/${coords.lat.toFixed(
    4
  )},${coords.lon.toFixed(4)}`;

  return (
    <>
      <div className="flex items-center gap-4">
        <CurrentIcon size={48} className="text-text shrink-0" />
        <div className="flex flex-col">
          <span className="text-3xl font-medium tabular-nums text-text leading-none">
            {Math.round(data.current.temp)}°
          </span>
          <span className="text-sm text-muted">
            {weatherLabelFor(data.current.symbolCode)}
          </span>
          {locationName ? (
            <span className="text-xs text-subtle mt-0.5">{locationName}</span>
          ) : null}
        </div>
      </div>

      <StatsGrid current={data.current} size={size} config={config} />
      {showForecast ? <ForecastList daily={data.daily} /> : null}

      <div className="mt-2 flex items-center gap-2 text-[11px] text-subtle tabular-nums">
        <span suppressHydrationWarning>
          Oppdatert {formatTimeOfDay(new Date(data.fetchedAt))}
        </span>
        {refreshing ? (
          <span
            aria-hidden
            className="inline-block w-1 h-1 rounded-full bg-accent animate-pulse"
          />
        ) : null}
        <span aria-hidden className="text-subtle">·</span>
        <a
          href={yrUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-subtle hover:text-text transition-colors"
        >
          yr.no
        </a>
      </div>
    </>
  );
}

function ForecastList({
  daily,
}: {
  daily: WeatherResponse["daily"];
}) {
  if (daily.length === 0) {
    return null;
  }
  return (
    <ul className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
      {daily.map((d) => {
        const Icon = weatherIconFor(d.symbolCode);
        const date = new Date(`${d.date}T12:00:00Z`);
        const weekday = new Intl.DateTimeFormat("nb-NO", {
          weekday: "short",
        }).format(date);
        return (
          <li
            key={d.date}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2.5">
              <Icon size={20} className="text-muted" />
              <span className="text-text">{weekday}</span>
              <span className="text-subtle text-xs">
                {weatherLabelFor(d.symbolCode)}
              </span>
            </div>
            <span className="tabular-nums text-text">
              {Math.round(d.tempMax)}° /{" "}
              <span className="text-muted">{Math.round(d.tempMin)}°</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
