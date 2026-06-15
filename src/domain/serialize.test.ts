import { describe, expect, it } from 'vitest';
import { parseMarkdownLight } from '@/components/MarkdownText';
import { deserializeProject, serializeProject } from './serialize';
import { createEmptyProject } from './model';

describe('serializeProject', () => {
  it('roundtrips project state', () => {
    const project = {
      ...createEmptyProject(),
      proTitle: 'Pro-Seite',
      arguments: [
        {
          id: 'a1',
          text: '**Wichtig**',
          side: 'pro' as const,
          weight: 2 as const,
          colorId: 'accent' as const,
        },
      ],
      legend: [{ colorId: 'accent' as const, label: 'Ökologie' }],
    };

    const raw = serializeProject(project);
    const restored = deserializeProject(raw);

    expect(restored.proTitle).toBe('Pro-Seite');
    expect(restored.arguments[0]?.weight).toBe(2);
    expect(restored.legend[0]?.label).toBe('Ökologie');
  });
});

describe('parseMarkdownLight', () => {
  it('parses bold and links', () => {
    const nodes = parseMarkdownLight('**Pro** [Info](https://example.com)');
    expect(nodes.some((node) => node.type === 'strong')).toBe(true);
    expect(nodes.some((node) => node.type === 'link')).toBe(true);
  });
});
