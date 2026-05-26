"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useLayout } from "@/lib/layout-context";
import { useCardEditor } from "./CardEditorProvider";
import { CardFrame } from "./CardFrame";
import { getCardDefinition } from "@/cards/registry";
import { ALL_SIZES, type CardInstance } from "@/cards/types";

export function CardGrid() {
  const { cards, hydrated, reorder } = useLayout();

  // Pointer needs a small drag distance before it commits — that way clicks on
  // the edit/remove/arrow buttons don't accidentally start a drag.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Until localStorage has been read, render an invisible spacer so the
  // page layout doesn't jump once cards arrive.
  if (!hydrated) {
    return <div aria-hidden className="min-h-[200px]" />;
  }

  if (cards.length === 0) {
    return <EmptyState />;
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    reorder(String(active.id), String(over.id));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={rectSortingStrategy}
      >
        {/*
         * `grid-flow-dense` lets later small cards backfill the slot a
         * row-spanning card (e.g. an expanded weather card) skipped, so we
         * don't leave visible holes in the layout. Card data order is
         * unchanged — only the visual placement adapts.
         */}
        <div className="grid grid-flow-dense grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {cards.map((card, index) => (
            <CardRow
              key={card.id}
              card={card}
              isFirst={index === 0}
              isLast={index === cards.length - 1}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function CardRow({
  card,
  isFirst,
  isLast,
}: {
  card: CardInstance;
  isFirst: boolean;
  isLast: boolean;
}) {
  const definition = getCardDefinition(card.type);
  const { removeCard, moveBy } = useLayout();
  const { openEdit } = useCardEditor();

  if (!definition) {
    // Saved layout references a card type that no longer exists. Render an
    // explanatory placeholder so the user can remove it.
    return (
      <CardFrame
        id={card.id}
        size={card.size}
        label="Unknown"
        editable={false}
        isFirst={isFirst}
        isLast={isLast}
        onEdit={() => {}}
        onRemove={() => removeCard(card.id)}
        onMoveUp={() => moveBy(card.id, -1)}
        onMoveDown={() => moveBy(card.id, 1)}
      >
        <div className="text-sm text-muted">
          This card type ({card.type}) is no longer available.
        </div>
      </CardFrame>
    );
  }

  const Component = definition.Component;
  const label = definition.labelFor
    ? definition.labelFor(card.config)
    : definition.title;
  const allowedSizes = definition.sizes ?? ALL_SIZES;
  // Show the Edit button when there's anything meaningful to change —
  // either a config form, or more than one allowed size.
  const editable = Boolean(definition.ConfigForm) || allowedSizes.length > 1;
  // Cards with growable content (e.g. weather with many stats) opt into
  // spanning a second row so they don't stretch their row-mates.
  const rowSpan = definition.rowSpan
    ? definition.rowSpan(card.config, card.size)
    : 1;

  return (
    <CardFrame
      id={card.id}
      size={card.size}
      rowSpan={rowSpan}
      label={label}
      editable={editable}
      isFirst={isFirst}
      isLast={isLast}
      onEdit={() => openEdit(card)}
      onRemove={() => removeCard(card.id)}
      onMoveUp={() => moveBy(card.id, -1)}
      onMoveDown={() => moveBy(card.id, 1)}
    >
      <Component config={card.config} size={card.size} />
    </CardFrame>
  );
}

function EmptyState() {
  const { openAdd } = useCardEditor();
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 sm:py-24 gap-3 rounded-2xl border border-dashed border-border">
      <h2 className="text-lg font-medium text-text">Your canvas is empty.</h2>
      <p className="text-sm text-muted max-w-sm">
        Add a card to get started — a clock, today&apos;s date, the year&apos;s
        progress, or a stock you&apos;re watching.
      </p>
      <button
        type="button"
        onClick={openAdd}
        className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent text-bg text-sm font-medium px-4 h-9 hover:opacity-90 transition-opacity"
      >
        Add your first card
      </button>
    </div>
  );
}
