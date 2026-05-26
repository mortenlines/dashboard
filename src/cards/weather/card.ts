import type { CardDefinition } from "@/cards/types";
import {
  DEFAULT_WEATHER_CONFIG,
  WeatherCard,
  type WeatherConfig,
} from "./WeatherCard";
import { WeatherConfigForm } from "./WeatherConfigForm";

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
};

export type { WeatherConfig };
