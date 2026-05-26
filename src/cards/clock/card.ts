import type { CardDefinition } from "@/cards/types";
import { ClockCard, type ClockConfig } from "./ClockCard";
import { ClockConfigForm } from "./ClockConfigForm";
import { findTimezoneLabel } from "./timezones";

const defaultConfig: ClockConfig = {
  label: "Lokal",
  timezone: "",
};

function labelFor(config: ClockConfig): string {
  if (config.label.trim()) return config.label;
  return config.timezone ? findTimezoneLabel(config.timezone) : "Lokal";
}

export const clockCard: CardDefinition<ClockConfig> = {
  type: "clock",
  title: "Klokke",
  description: "Sanntid på et valgfritt sted.",
  category: "time",
  sizes: ["sm", "md"],
  defaultSize: "sm",
  defaultConfig,
  Component: ClockCard,
  ConfigForm: ClockConfigForm,
  labelFor,
};

export type { ClockConfig };
