"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CardEditorDialog, type CardEditorPayload } from "./CardEditorDialog";
import { useLayout } from "@/lib/layout-context";
import type { CardInstance } from "@/cards/types";

type EditorState =
  | { mode: "closed" }
  | { mode: "add" }
  | { mode: "edit"; card: CardInstance };

type EditorApi = {
  openAdd: () => void;
  openEdit: (card: CardInstance) => void;
};

const EditorContext = createContext<EditorApi | null>(null);

/**
 * Owns the add/edit dialog. Components anywhere in the tree can call
 * `useCardEditor().openAdd()` or `openEdit(card)`.
 */
export function CardEditorProvider({ children }: { children: ReactNode }) {
  const { addCard, updateCard } = useLayout();
  const [state, setState] = useState<EditorState>({ mode: "closed" });

  const openAdd = useCallback(() => setState({ mode: "add" }), []);
  const openEdit = useCallback(
    (card: CardInstance) => setState({ mode: "edit", card }),
    []
  );
  const close = useCallback(() => setState({ mode: "closed" }), []);

  const handleSave = (payload: CardEditorPayload) => {
    if (state.mode === "add") {
      addCard({
        type: payload.type,
        size: payload.size,
        config: payload.config,
      });
    } else if (state.mode === "edit") {
      updateCard(state.card.id, {
        size: payload.size,
        config: payload.config,
      });
    }
  };

  const api = useMemo<EditorApi>(() => ({ openAdd, openEdit }), [openAdd, openEdit]);

  return (
    <EditorContext.Provider value={api}>
      {children}
      <CardEditorDialog
        open={state.mode !== "closed"}
        mode={state.mode === "edit" ? "edit" : "add"}
        editingCard={state.mode === "edit" ? state.card : null}
        onClose={close}
        onSave={handleSave}
      />
    </EditorContext.Provider>
  );
}

export function useCardEditor(): EditorApi {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error("useCardEditor must be used inside <CardEditorProvider />");
  }
  return ctx;
}
