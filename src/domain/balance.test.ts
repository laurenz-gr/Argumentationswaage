import { describe, expect, it } from 'vitest';
import { calculateBalance } from './balance';
import type { ArgumentItem } from './model';

function arg(
  overrides: Partial<ArgumentItem> & Pick<ArgumentItem, 'side' | 'weight'>,
): ArgumentItem {
  return {
    id: '1',
    text: 'Test',
    colorId: 'default',
    ...overrides,
  };
}

describe('calculateBalance', () => {
  it('tilts right when pro arguments outweigh contra', () => {
    const result = calculateBalance([
      arg({ side: 'pro', weight: 3 }),
      arg({ id: '2', side: 'contra', weight: 1 }),
    ]);

    expect(result.proScore).toBe(3);
    expect(result.contraScore).toBe(1);
    expect(result.netScore).toBe(2);
    expect(result.tiltDegrees).toBeGreaterThan(0);
  });

  it('ignores staging arguments', () => {
    const result = calculateBalance([arg({ side: 'staging', weight: null })]);

    expect(result.netScore).toBe(0);
    expect(result.tiltDegrees).toBe(0);
  });
});
