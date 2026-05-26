"use client";

import { useState } from "react";
import { Dialog } from "./Dialog";
import { Button } from "./Button";
import { IconSpinner } from "./Icons";
import { getCardDefinition, listCardDefinitions } from "@/cards/registry";
import {
  ALL_SIZES,
  SIZE_LABELS,
  type CardInstance,
  type CardSize,
} from "@/cards/types";

type EditorMode = "add" | "edit";

export type CardEditorPayload = {
  type: string;
  size: CardSize;
  config: unknown;
};

type CardEditorDialogProps = {
  open: boolean;
  mode: EditorMode;
  editingCard: CardInstance | null;
  onClose: () => void;
  onSave: (payload: CardEditorPayload) => void;
};

/**
 * Modal for adding or editing a card. Remounts its body each time it opens
 * with a different target — that way the body's local state always starts
 * at the right initial values.
 */
export function CardEditorDialog({
  open,
  mode,
  editingCard,
  onClose,
  onSave,
}: CardEditorDialogProps) {
  const bodyKey =
    mode === "edit" ? `edit-${editingCard?.id ?? ""}` : "add";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={mode === "edit" ? "Rediger kort" : "Legg til et kort"}
    >
      {open ? (
        <EditorBody
          key={bodyKey}
          mode={mode}
          editingCard={editingCard}
          onClose={onClose}
          onSave={onSave}
        />
      ) : null}
    </Dialog>
  );
}

function EditorBody({
  mode,
  editingCard,
  onClose,
  onSave,
}: {
  mode: EditorMode;
  editingCard: CardInstance | null;
  onClose: () => void;
  onSave: (payload: CardEditorPayload) => void;
}) {
  const initialType = mode === "edit" && editingCard ? editingCard.type : null;
  const initialDef = initialType ? getCardDefinition(initialType) : null;

  const [selectedType, setSelectedType] = useState<string | null>(initialType);
  const [size, setSize] = useState<CardSize>(
    (editingCard?.size as CardSize) ??
      (initialDef?.defaultSize as CardSize) ??
      "sm"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [config, setConfig] = useState<any>(
    editingCard?.config ?? initialDef?.defaultConfig ?? {}
  );
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const definition = selectedType ? getCardDefinition(selectedType) : null;

  // --- Step 1 (add mode only): pick a card type ---
  if (mode === "add" && !selectedType) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">
          Velg hva slags kort du vil legge til.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {listCardDefinitions().map((def) => (
            <button
              key={def.type}
              type="button"
              onClick={() => {
                setSelectedType(def.type);
                setSize(def.defaultSize);
                setConfig(def.defaultConfig);
                setError(null);
              }}
              className="text-left p-3 rounded-lg border border-border bg-surface hover:border-border-hover hover:bg-surface-hover transition-colors"
            >
              <div className="text-sm font-medium text-text">{def.title}</div>
              <div className="text-xs text-muted mt-0.5">
                {def.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!definition) return null;

  const ConfigForm = definition.ConfigForm;
  const allowedSizes = definition.sizes ?? ALL_SIZES;

  const handleSave = async () => {
    setError(null);

    if (definition.validateConfig) {
      setValidating(true);
      try {
        const result = await definition.validateConfig(config);
        if (!result.ok) {
          setError(result.message);
          return;
        }
      } catch (err) {
        setError(
          `Validation crashed: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
        return;
      } finally {
        setValidating(false);
      }
    }

    onSave({ type: definition.type, size, config });
    onClose();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb / change-type affordance, only in add mode */}
      {mode === "add" ? (
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <span className="text-sm font-medium text-text">
            {definition.title}
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedType(null);
              setError(null);
            }}
            className="text-xs text-muted hover:text-text transition-colors"
          >
            ← Velg en annen type
          </button>
        </div>
      ) : null}

      {/* Size selector */}
      <fieldset>
        <legend className="text-xs font-medium text-muted mb-1.5">Størrelse</legend>
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${allowedSizes.length}, 1fr)` }}
        >
          {allowedSizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              aria-pressed={size === s}
              className={`text-sm rounded-lg px-3 py-2 border transition-colors ${
                size === s
                  ? "border-accent bg-surface-hover text-text"
                  : "border-border text-muted hover:border-border-hover hover:text-text"
              }`}
            >
              {SIZE_LABELS[s]}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Card-specific config form */}
      {ConfigForm ? (
        <ConfigForm value={config} onChange={setConfig} />
      ) : (
        <p className="text-sm text-muted">Dette kortet har ingen innstillinger.</p>
      )}

      {/* Validation error */}
      {error ? (
        <div className="text-sm text-negative border border-negative/30 bg-negative/5 rounded-lg px-3 py-2">
          {error}
        </div>
      ) : null}

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
        <Button variant="ghost" onClick={onClose} disabled={validating}>
          Avbryt
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={validating}
        >
          {validating ? (
            <>
              <IconSpinner size={14} />
              Validerer
            </>
          ) : mode === "edit" ? (
            "Lagre endringer"
          ) : (
            "Legg til kort"
          )}
        </Button>
      </div>
    </div>
  );
}
