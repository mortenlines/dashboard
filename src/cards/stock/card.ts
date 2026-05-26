import type { CardDefinition, CardValidationResult } from "@/cards/types";
import { StockCard, type StockConfig } from "./StockCard";
import { StockConfigForm } from "./StockConfigForm";

const defaultConfig: StockConfig = {
  symbol: "",
  updateIntervalSeconds: 60,
};

async function validateConfig(
  config: StockConfig
): Promise<CardValidationResult> {
  const symbol = config.symbol.trim().toUpperCase();
  if (!symbol) {
    return { ok: false, message: "Skriv inn et tickersymbol." };
  }

  if (!Number.isFinite(config.updateIntervalSeconds)) {
    return { ok: false, message: "Velg et oppdateringsintervall." };
  }
  if (config.updateIntervalSeconds < 30) {
    return { ok: false, message: "Minimum oppdateringsintervall er 30 sekunder." };
  }

  try {
    const res = await fetch(
      `/api/symbols/verify?symbol=${encodeURIComponent(symbol)}`,
      { cache: "no-store" }
    );
    const body = (await res.json()) as
      | { ok: true; symbol: string; description: string }
      | { ok: false; message: string };
    if (!body.ok) {
      return { ok: false, message: body.message };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message: `Kunne ikke nå verifikasjons-APIen (${
        err instanceof Error ? err.message : "ukjent"
      }).`,
    };
  }
}

export const stockCard: CardDefinition<StockConfig> = {
  type: "stock",
  title: "Aksjekurs",
  description: "Sanntidskurs for en børsnotert aksje.",
  category: "finance",
  sizes: ["sm", "md"],
  defaultSize: "sm",
  defaultConfig,
  Component: StockCard,
  ConfigForm: StockConfigForm,
  validateConfig,
  labelFor: (c) => c.symbol.trim().toUpperCase() || "Aksje",
};

export type { StockConfig };
