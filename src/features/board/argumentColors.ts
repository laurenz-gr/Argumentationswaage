import type { ArgumentColorId } from '@/domain/model';

const COLOR_VARS: Record<ArgumentColorId, { bg: string; ink: string }> = {
  default: { bg: 'var(--arg-default-bg)', ink: 'var(--arg-default-ink)' },
  accent: { bg: 'var(--arg-accent-bg)', ink: 'var(--arg-accent-ink)' },
  accent2: { bg: 'var(--arg-accent2-bg)', ink: 'var(--arg-accent2-ink)' },
  danger: { bg: 'var(--arg-danger-bg)', ink: 'var(--arg-danger-ink)' },
  mint: { bg: 'var(--arg-mint-bg)', ink: 'var(--arg-mint-ink)' },
  violet: { bg: 'var(--arg-violet-bg)', ink: 'var(--arg-violet-ink)' },
  amber: { bg: 'var(--arg-amber-bg)', ink: 'var(--arg-amber-ink)' },
};

export function argumentColorStyle(colorId: ArgumentColorId) {
  const colors = COLOR_VARS[colorId];
  return {
    background: colors.bg,
    color: colors.ink,
  };
}
