"use client";

import { useEffect, useRef, type ReactNode, type MouseEvent } from "react";
import { IconX } from "./Icons";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Thin wrapper around the native <dialog> element. Modal mode (showModal)
 * gets focus trap and inert background for free. Click on the backdrop or
 * press Escape to close.
 */
export function Dialog({ open, onClose, title, children, footer }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  // Sync the imperative <dialog> open state with the React prop.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  // Intercept the native "cancel" event (Esc) so we can call the React handler.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener("cancel", handler);
    return () => el.removeEventListener("cancel", handler);
  }, [onClose]);

  // A click whose target is the dialog element itself = click on the backdrop.
  const onBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) onClose();
  };

  return (
    <dialog
      ref={ref}
      onClick={onBackdropClick}
      aria-labelledby="dialog-title"
      className="bg-surface text-text border border-border rounded-2xl p-0 w-[calc(100%-2rem)] max-w-md card-glass"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 id="dialog-title" className="text-base font-medium">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex items-center justify-center w-7 h-7 rounded-full text-muted hover:text-text hover:bg-surface-hover transition-colors"
        >
          <IconX size={14} />
        </button>
      </div>
      <div className="p-5 max-h-[60vh] overflow-y-auto">{children}</div>
      {footer ? (
        <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-2 bg-surface-hover/40">
          {footer}
        </div>
      ) : null}
    </dialog>
  );
}
