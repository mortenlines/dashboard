"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties, ReactNode } from "react";
import type { CardRowSpan, CardSize } from "@/cards/types";
import {
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconGrip,
  IconTrash,
} from "./Icons";

const SIZE_CLASSES: Record<CardSize, string> = {
  sm: "col-span-1",
  md: "col-span-1 sm:col-span-2",
  lg: "col-span-1 sm:col-span-2 lg:col-span-4",
};

const ROW_SPAN_CLASSES: Record<CardRowSpan, string> = {
  1: "",
  2: "row-span-2",
};

type CardFrameProps = {
  id: string;
  size: CardSize;
  /**
   * Number of grid row tracks the card should occupy. Defaults to 1.
   * Tall cards (e.g. weather with multiple stats) ask for 2 so they don't
   * stretch the single-row cards sharing their row.
   */
  rowSpan?: CardRowSpan;
  label?: string;
  /** Whether to show the edit button (true for cards with a config form). */
  editable: boolean;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  children: ReactNode;
};

export function CardFrame({
  id,
  size,
  rowSpan = 1,
  label,
  editable,
  isFirst,
  isLast,
  onEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
  children,
}: CardFrameProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-surface border border-border rounded-2xl card-glass p-5 sm:p-6 flex flex-col gap-3 min-h-[120px] transition-colors hover:border-border-hover ${
        SIZE_CLASSES[size]
      } ${ROW_SPAN_CLASSES[rowSpan]} ${
        isDragging ? "opacity-60 shadow-xl" : ""
      }`}
    >
      {/* Controls — visible on hover/focus-within. */}
      <div
        className="absolute top-2.5 right-2.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
        // Prevent the drag listeners (attached to the frame) from swallowing these clicks.
        onPointerDown={(e) => e.stopPropagation()}
      >
        <ControlButton
          label="Flytt opp"
          onClick={onMoveUp}
          disabled={isFirst}
        >
          <IconChevronUp size={14} />
        </ControlButton>
        <ControlButton
          label="Flytt ned"
          onClick={onMoveDown}
          disabled={isLast}
        >
          <IconChevronDown size={14} />
        </ControlButton>
        {editable ? (
          <ControlButton label="Rediger kort" onClick={onEdit}>
            <IconEdit size={13} />
          </ControlButton>
        ) : null}
        <ControlButton label="Fjern kort" onClick={onRemove} danger>
          <IconTrash size={13} />
        </ControlButton>
      </div>

      {/* Drag handle — small grip in the bottom-right, visible on hover. */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Dra for å sortere"
        className="absolute bottom-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-md text-subtle opacity-0 group-hover:opacity-70 hover:opacity-100 focus-visible:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
      >
        <IconGrip size={14} />
      </button>

      {label ? (
        <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtle">
          {label}
        </div>
      ) : null}
      <div className="flex-1 flex flex-col justify-end">{children}</div>
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
        danger
          ? "text-muted hover:text-negative hover:bg-surface-hover"
          : "text-muted hover:text-text hover:bg-surface-hover"
      } disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-muted disabled:hover:bg-transparent`}
    >
      {children}
    </button>
  );
}
