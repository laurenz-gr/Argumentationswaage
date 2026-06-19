import { beforeEach, describe, expect, it } from 'vitest';
import { createEmptyProject } from '@/domain/model';
import { useProjectStore } from './useProjectStore';

function reset() {
  globalThis.localStorage?.clear?.();
  useProjectStore.setState(createEmptyProject());
  useProjectStore.temporal.getState().clear();
}

describe('useProjectStore', () => {
  beforeEach(reset);

  it('places an argument on a weighted zone', () => {
    const store = useProjectStore.getState();
    store.addArgument('Pro Punkt');
    const id = useProjectStore.getState().arguments[0].id;

    store.moveArgumentToZone(id, 'pro-2');

    const item = useProjectStore.getState().arguments[0];
    expect(item.side).toBe('pro');
    expect(item.weight).toBe(2);
  });

  it('removes an argument when moved to trash', () => {
    const store = useProjectStore.getState();
    store.addArgument('Weg damit');
    const id = useProjectStore.getState().arguments[0].id;

    store.moveArgumentToZone(id, 'trash');

    expect(useProjectStore.getState().arguments).toHaveLength(0);
  });

  it('keeps a legend label even when the color is no longer used', () => {
    const store = useProjectStore.getState();
    store.addArgument('Kosten');
    const id = useProjectStore.getState().arguments[0].id;

    store.setArgumentColor(id, 'danger');
    store.updateLegendLabel('danger', 'Finanzen');
    store.setArgumentColor(id, 'default');

    const entry = useProjectStore
      .getState()
      .legend.find((item) => item.colorId === 'danger');
    expect(entry?.label).toBe('Finanzen');
  });

  it('supports undo via the temporal store', () => {
    const store = useProjectStore.getState();
    store.addArgument('Erstes Argument');
    expect(useProjectStore.getState().arguments).toHaveLength(1);

    useProjectStore.temporal.getState().undo();

    expect(useProjectStore.getState().arguments).toHaveLength(0);
  });
});
