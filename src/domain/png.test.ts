import { describe, expect, it } from 'vitest';
import { embedTextInPngDataUrl, extractTextFromPngBytes, dataUrlToBytes } from './png';

function minimalPngDataUrl(): string {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  const iend = [0, 0, 0, 0, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82];
  const bytes = new Uint8Array([...signature, ...iend]);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return `data:image/png;base64,${btoa(binary)}`;
}

describe('png metadata roundtrip', () => {
  it('embeds and extracts a tEXt chunk before IEND', () => {
    const payload = btoa('{"hello":"welt"}');
    const enriched = embedTextInPngDataUrl(minimalPngDataUrl(), 'argumentationswaage', payload);
    const extracted = extractTextFromPngBytes(dataUrlToBytes(enriched), 'argumentationswaage');

    expect(extracted).toBe(payload);
  });

  it('returns null when keyword is absent', () => {
    const extracted = extractTextFromPngBytes(dataUrlToBytes(minimalPngDataUrl()), 'argumentationswaage');
    expect(extracted).toBeNull();
  });
});
