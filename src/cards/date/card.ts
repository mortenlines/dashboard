import type { CardDefinition } from "@/cards/types";
import { DateCard, type DateConfig } from "./DateCard";

export const dateCard: CardDefinition<DateConfig> = {
  type: "date",
  title: "Dato",
  description: "Ukedag og dato i dag.",
  category: "time",
  sizes: ["sm", "md"],
  defaultSize: "sm",
  defaultConfig: {},
  Component: DateCard,
  labelFor: () => "I dag",
};

export type { DateConfig };
