import type { ComponentType } from "react";

/** Visual span of a card in the 4-column bento grid. */
export type CardSize = "sm" | "md" | "lg";

export const ALL_SIZES: readonly CardSize[] = ["sm", "md", "lg"] as const;

export const SIZE_LABELS: Record<CardSize, string> = {
  sm: "Liten",
  md: "Middels",
  lg: "Bred",
};

export type CardCategory = "time" | "finance" | "info" | "other";

/**
 * Props passed to every card's display component.
 * The frame (label, controls, sizing) is rendered by CardFrame, not by the card itself.
 */
export type CardComponentProps<TConfig> = {
  config: TConfig;
  size: CardSize;
};

/**
 * Props passed to a card's optional configuration form.
 * Forms are uncontrolled at the data level: they receive the current value
 * and call onChange with the next value. Validation happens at save time.
 */
export type CardConfigFormProps<TConfig> = {
  value: TConfig;
  onChange: (next: TConfig) => void;
};

/** Async validation result, used before saving a card. */
export type CardValidationResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * A registered card type. There is exactly one definition per kind of card
 * (e.g. one Clock definition, instantiated many times with different timezones).
 *
 * The generic parameter carries the card's config shape. The registry stores
 * `AnyCardDefinition` so different config types can coexist.
 */
export type CardDefinition<TConfig> = {
  /** Stable identifier used to look up the definition from an instance. */
  type: string;
  title: string;
  description: string;
  category: CardCategory;
  /** Sizes the card is allowed to take. Defaults to all sizes when omitted. */
  sizes?: readonly CardSize[];
  defaultSize: CardSize;
  /** The starting value of a freshly-added card's config. */
  defaultConfig: TConfig;
  Component: ComponentType<CardComponentProps<TConfig>>;
  /** Optional form rendered in the add/edit dialog. Cards without options omit this. */
  ConfigForm?: ComponentType<CardConfigFormProps<TConfig>>;
  /** Optional validator. Runs before the card is saved; reject = no save. */
  validateConfig?: (config: TConfig) => Promise<CardValidationResult>;
  /** Compute the small label shown in the card frame. Defaults to `title`. */
  labelFor?: (config: TConfig) => string;
};

/**
 * Type used by the polymorphic registry. Each entry can have its own config shape;
 * type safety is preserved at each card's definition site.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyCardDefinition = CardDefinition<any>;

/** A specific card on the page. Refers to a definition by type. */
export type CardInstance = {
  /** Unique among cards on the page. Generated at add time. */
  id: string;
  type: string;
  size: CardSize;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
};
