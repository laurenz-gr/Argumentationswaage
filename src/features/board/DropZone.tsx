import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import type { DropZoneId } from '@/domain/model';

interface DropZoneProps {
  id: DropZoneId;
  label?: string;
  className?: string;
  children?: ReactNode;
}

export function DropZone({ id, label, className = '', children }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { type: 'zone', zoneId: id },
  });

  return (
    <div
      ref={setNodeRef}
      className={`drop-zone${isOver ? ' is-over' : ''} ${className}`.trim()}
      data-testid={`drop-zone-${id}`}
    >
      {label ? <div className="weight-label">{label}</div> : null}
      {children}
    </div>
  );
}
