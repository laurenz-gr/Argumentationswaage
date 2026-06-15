import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';
import type { DropZoneId } from '@/domain/model';
import { useProjectStore } from '@/store/useProjectStore';
import { ArgumentCard } from './ArgumentCard';
import { LegendPanel } from './LegendPanel';
import { SeesawBoard } from './SeesawBoard';
import { StagingArea } from './StagingArea';
import { DropZone } from './DropZone';
import { useTranslation } from '@/i18n';

export function BoardWorkspace() {
  const { t } = useTranslation();
  const argumentsList = useProjectStore((state) => state.arguments);
  const moveArgumentToZone = useProjectStore((state) => state.moveArgumentToZone);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeItem = argumentsList.find((item) => item.id === activeId) ?? null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      return;
    }

    const zoneId = String(over.id) as DropZoneId;
    moveArgumentToZone(String(active.id), zoneId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="board-layout">
        <div className="board-grid">
          <div className="stack">
            <StagingArea />
            <LegendPanel />
          </div>
          <SeesawBoard />
        </div>

        <DropZone id="trash" className="trash-zone no-print">
          {t('moveToTrash')}
        </DropZone>

        <p className="muted no-print">{t('keyboardHint')}</p>
      </div>

      <DragOverlay>
        {activeItem ? <ArgumentCard item={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
