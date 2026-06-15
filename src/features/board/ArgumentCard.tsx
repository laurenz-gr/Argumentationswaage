import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Check, Copy, GripVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ArgumentColorId, ArgumentItem } from '@/domain/model';
import { ARGUMENT_COLORS, dropZoneId } from '@/domain/model';
import { useTranslation } from '@/i18n';
import type { TranslationKey } from '@/i18n/de';
import { useProjectStore } from '@/store/useProjectStore';
import type { ArgumentSide, ArgumentWeight } from '@/domain/model';
import { WEIGHTS } from '@/domain/model';
import { MarkdownText } from '@/components/MarkdownText';
import { argumentColorStyle } from './argumentColors';

interface ArgumentCardProps {
  item: ArgumentItem;
}

const COLOR_LABEL_KEYS: Record<ArgumentColorId, TranslationKey> = {
  default: 'colorDefault',
  accent: 'colorAccent',
  accent2: 'colorAccent2',
  danger: 'colorDanger',
  mint: 'colorMint',
  violet: 'colorViolet',
  amber: 'colorAmber',
};

export function ArgumentCard({ item }: ArgumentCardProps) {
  const { t } = useTranslation();
  const updateArgumentText = useProjectStore((state) => state.updateArgumentText);
  const setArgumentColor = useProjectStore((state) => state.setArgumentColor);
  const deleteArgument = useProjectStore((state) => state.deleteArgument);
  const duplicateArgument = useProjectStore((state) => state.duplicateArgument);
  const moveArgumentToZone = useProjectStore((state) => state.moveArgumentToZone);
  const [editing, setEditing] = useState(item.text.length === 0);

  const placeOn = (side: 'pro' | 'contra', weight: ArgumentWeight) => {
    moveArgumentToZone(item.id, dropZoneId(side, weight));
  };

  const handleKeyboardMove = (event: React.KeyboardEvent) => {
    if (editing) {
      return;
    }

    let side: ArgumentSide = item.side;
    let weight: ArgumentWeight | null = item.weight;

    if (event.key === 'ArrowRight') {
      side = 'pro';
      weight = weight ?? 1;
    } else if (event.key === 'ArrowLeft') {
      side = 'contra';
      weight = weight ?? 1;
    } else if (event.key === 'ArrowUp' && weight !== null) {
      const index = WEIGHTS.indexOf(weight);
      weight = WEIGHTS[Math.min(WEIGHTS.length - 1, index + 1)] ?? weight;
    } else if (event.key === 'ArrowDown' && weight !== null) {
      const index = WEIGHTS.indexOf(weight);
      weight = WEIGHTS[Math.max(0, index - 1)] ?? weight;
    } else {
      return;
    }

    event.preventDefault();
    if (side === 'staging' || weight === null) {
      return;
    }
    moveArgumentToZone(item.id, `${side}-${weight}`);
  };

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { type: 'argument', itemId: item.id },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    ...argumentColorStyle(item.colorId),
  };
  const placed = item.side !== 'staging';

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`argument-card${placed ? ' is-placed' : ''}${isDragging ? ' is-dragging' : ''}`}
      data-testid={`argument-${item.id}`}
      tabIndex={0}
      onKeyDown={handleKeyboardMove}
      onKeyDownCapture={handleKeyboardMove}
    >
      <div className="argument-card-footer">
        <button
          type="button"
          className="btn ghost icon-only"
          aria-label={t('move')}
          data-testid={`drag-handle-${item.id}`}
          {...listeners}
          {...attributes}
        >
          <GripVertical size={18} />
        </button>
        <button
          type="button"
          className="btn ghost icon-only"
          aria-label={t('duplicate')}
          onClick={() => duplicateArgument(item.id)}
        >
          <Copy size={16} />
        </button>
        <button
          type="button"
          className="btn ghost icon-only"
          aria-label={t('delete')}
          onClick={() => deleteArgument(item.id)}
        >
          <Trash2 size={16} />
        </button>
        {item.weight !== null ? (
          <span className="weight-badge">
            {item.side === 'contra' ? '-' : '+'}
            {item.weight}
          </span>
        ) : null}
      </div>

      {editing ? (
        <textarea
          className="textarea"
          value={item.text}
          placeholder={t('emptyArgument')}
          aria-label={t('edit')}
          onChange={(event) => updateArgumentText(item.id, event.target.value)}
          onBlur={() => setEditing(false)}
          autoFocus
        />
      ) : (
        <button
          type="button"
          className="argument-display"
          onClick={() => setEditing(true)}
        >
          <MarkdownText source={item.text || t('emptyArgument')} />
        </button>
      )}

      <div className="argument-card-footer placement-row" role="group" aria-label={t('weight')}>
        {WEIGHTS.map((weight) => {
          const current = item.side === 'pro' && item.weight === weight;
          return (
            <button
              key={`pro-${weight}`}
              type="button"
              className={`btn ghost placement-btn${current ? ' is-current' : ''}`}
              data-testid={`place-pro-${weight}-${item.id}`}
              aria-label={`${t('placePro')} ${weight}`}
              aria-pressed={current}
              onClick={() => placeOn('pro', weight)}
            >
              +{weight}
            </button>
          );
        })}
        {WEIGHTS.map((weight) => {
          const current = item.side === 'contra' && item.weight === weight;
          return (
            <button
              key={`contra-${weight}`}
              type="button"
              className={`btn ghost placement-btn${current ? ' is-current' : ''}`}
              data-testid={`place-contra-${weight}-${item.id}`}
              aria-label={`${t('placeContra')} ${weight}`}
              aria-pressed={current}
              onClick={() => placeOn('contra', weight)}
            >
              -{weight}
            </button>
          );
        })}
      </div>

      <div className="argument-card-footer color-row" role="group" aria-label={t('color')}>
        {ARGUMENT_COLORS.map((colorId) => {
          const active = item.colorId === colorId;
          const colorName = t(COLOR_LABEL_KEYS[colorId]);
          return (
            <button
              key={colorId}
              type="button"
              className={`color-swatch${active ? ' is-active' : ''}`}
              style={argumentColorStyle(colorId as ArgumentColorId)}
              aria-label={active ? `${t('color')}: ${colorName} (${t('selected')})` : `${t('color')}: ${colorName}`}
              aria-pressed={active}
              onClick={() => setArgumentColor(item.id, colorId)}
            >
              {active ? <Check className="swatch-check" aria-hidden /> : null}
            </button>
          );
        })}
      </div>
    </article>
  );
}
