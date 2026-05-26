import type { CardDefinition } from "@/cards/types";
import { YearProgressCard, type YearProgressConfig } from "./YearProgressCard";
import { YearProgressConfigForm } from "./YearProgressConfigForm";

const defaultConfig: YearProgressConfig = {
  showDays: false,
  showHours: false,
  showMonths: false,
};

export const yearProgressCard: CardDefinition<YearProgressConfig> = {
  type: "year-progress",
  title: "Årsframgang",
  description: "Hvor mye av kalenderåret som har gått.",
  category: "info",
  sizes: ["sm", "md", "lg"],
  defaultSize: "md",
  defaultConfig,
  Component: YearProgressCard,
  ConfigForm: YearProgressConfigForm,
  labelFor: () => `${new Date().getFullYear()} framgang`,
};

export type { YearProgressConfig };
