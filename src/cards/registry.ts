import type { AnyCardDefinition } from "./types";
import { clockCard } from "./clock/card";
import { dateCard } from "./date/card";
import { yearProgressCard } from "./year-progress/card";
import { stockCard } from "./stock/card";
import { weatherCard } from "./weather/card";

/**
 * The single source of truth for available card types. Adding a new card
 * means: create a folder under src/cards/<name>, export a CardDefinition
 * from <name>/card.ts, and add it to this list. Nothing else changes.
 */
const definitions: readonly AnyCardDefinition[] = [
  clockCard,
  dateCard,
  yearProgressCard,
  stockCard,
  weatherCard,
];

const byType = new Map(definitions.map((d) => [d.type, d]));

export function getCardDefinition(type: string): AnyCardDefinition | undefined {
  return byType.get(type);
}

export function listCardDefinitions(): readonly AnyCardDefinition[] {
  return definitions;
}
