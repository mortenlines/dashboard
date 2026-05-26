import type { CardDefinition } from "@/cards/types";
import {
  DEFAULT_WEATHER_CONFIG,
  normalizeWeatherConfig,
  WeatherCard,
  type WeatherConfig,
} from "./WeatherCard";
import { WeatherConfigForm } from "./WeatherConfigForm";

/**
 * The four stat toggles in the weather config. Counting how many are enabled
 * tells us roughly how tall the card will render — at 2+ stats the card grows
 * past the height of a single grid row, so we ask the grid for two rows.
 */
const STAT_KEYS = [
  "showFeelsLike",
  "showWind",
  "showRain",
  "showUv",
] as const satisfies readonly (keyof WeatherConfig)[];

export const weatherCard: CardDefinition<WeatherConfig> = {
  type: "weather",
  title: "Vær",
  description:
    "Sanntidsvær på din nåværende posisjon. Medium størrelse legger til 2-dagersvarsel.",
  category: "info",
  sizes: ["sm", "md"],
  defaultSize: "sm",
  defaultConfig: DEFAULT_WEATHER_CONFIG,
  Component: WeatherCard,
  ConfigForm: WeatherConfigForm,
  labelFor: () => "Vær",
  rowSpan: (config) => {
    const normalized = normalizeWeatherConfig(config);
    const enabledStats = STAT_KEYS.reduce(
      (count, key) => (normalized[key] ? count + 1 : count),
      0
    );
    return enabledStats >= 2 ? 2 : 1;
  },
};

export type { WeatherConfig };
