const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

const crcTable: number[] = (() => {
  const table = new Array<number>(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function textToLatin1Bytes(text: string): Uint8Array {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) {
    bytes[i] = text.charCodeAt(i) & 0xff;
  }
  return bytes;
}

function buildTextChunk(keyword: string, text: string): Uint8Array {
  const keywordBytes = textToLatin1Bytes(keyword);
  const textBytes = textToLatin1Bytes(text);
  const dataLength = keywordBytes.length + 1 + textBytes.length;

  const chunk = new Uint8Array(12 + dataLength);
  const view = new DataView(chunk.buffer);

  view.setUint32(0, dataLength);
  chunk[4] = 0x74; // t
  chunk[5] = 0x45; // E
  chunk[6] = 0x58; // X
  chunk[7] = 0x74; // t

  let offset = 8;
  chunk.set(keywordBytes, offset);
  offset += keywordBytes.length;
  chunk[offset] = 0;
  offset += 1;
  chunk.set(textBytes, offset);

  const crc = crc32(chunk.subarray(4, 8 + dataLength));
  view.setUint32(8 + dataLength, crc);

  return chunk;
}

export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToDataUrl(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:image/png;base64,${btoa(binary)}`;
}

export function embedTextInPngDataUrl(
  dataUrl: string,
  keyword: string,
  text: string,
): string {
  const original = dataUrlToBytes(dataUrl);
  const chunk = buildTextChunk(keyword, text);

  const iendStart = findIendStart(original);
  const result = new Uint8Array(original.length + chunk.length);
  result.set(original.subarray(0, iendStart), 0);
  result.set(chunk, iendStart);
  result.set(original.subarray(iendStart), iendStart + chunk.length);

  return bytesToDataUrl(result);
}

function findIendStart(bytes: Uint8Array): number {
  let offset = PNG_SIGNATURE.length;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  while (offset + 8 <= bytes.length) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7],
    );
    if (type === 'IEND') {
      return offset;
    }
    offset += 12 + length;
  }

  return bytes.length;
}

export function extractTextFromPngBytes(
  bytes: Uint8Array,
  keyword: string,
): string | null {
  if (bytes.length < PNG_SIGNATURE.length) {
    return null;
  }

  let offset = PNG_SIGNATURE.length;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const keywordBytes = textToLatin1Bytes(keyword);

  while (offset + 8 <= bytes.length) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7],
    );

    if (type === 'tEXt') {
      const dataStart = offset + 8;
      const data = bytes.subarray(dataStart, dataStart + length);
      const nullIndex = data.indexOf(0);
      if (nullIndex === keywordBytes.length && startsWith(data, keywordBytes)) {
        const textBytes = data.subarray(nullIndex + 1);
        let text = '';
        for (let i = 0; i < textBytes.length; i += 1) {
          text += String.fromCharCode(textBytes[i]);
        }
        return text;
      }
    }

    offset += 12 + length;
  }

  return null;
}

function startsWith(data: Uint8Array, prefix: Uint8Array): boolean {
  for (let i = 0; i < prefix.length; i += 1) {
    if (data[i] !== prefix[i]) {
      return false;
    }
  }
  return true;
}
