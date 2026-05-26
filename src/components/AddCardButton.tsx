"use client";

import { useCardEditor } from "./CardEditorProvider";
import { Button } from "./Button";
import { IconPlus } from "./Icons";

export function AddCardButton() {
  const { openAdd } = useCardEditor();
  return (
    <Button variant="primary" onClick={openAdd}>
      <IconPlus size={14} />
      Legg til kort
    </Button>
  );
}
