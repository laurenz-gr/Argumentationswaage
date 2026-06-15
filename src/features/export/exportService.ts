import {
  EMBED_KEY,
  PROJECT_FILE_EXTENSION,
  PROJECT_MIME,
  deserializeProject,
  downloadTextFile,
  embedProjectInPngMetadata,
  extractProjectFromPngMetadata,
  readFileAsText,
  serializeProject,
} from '@/domain/serialize';
import {
  dataUrlToBytes,
  embedTextInPngDataUrl,
  extractTextFromPngBytes,
} from '@/domain/png';
import type { ProjectState } from '@/domain/model';

export async function exportProjectJson(project: ProjectState): Promise<void> {
  const filename = `argumentationswaage-${formatStamp()}${PROJECT_FILE_EXTENSION}`;
  downloadTextFile(filename, serializeProject(project), PROJECT_MIME);
}

export async function importProjectFromFile(file: File): Promise<ProjectState> {
  if (file.name.endsWith(PROJECT_FILE_EXTENSION) || file.type === PROJECT_MIME) {
    return deserializeProject(await readFileAsText(file));
  }

  if (file.type.startsWith('image/')) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const encoded = extractTextFromPngBytes(bytes, EMBED_KEY);
    if (!encoded) {
      throw new Error('PNG metadata missing');
    }
    return extractProjectFromPngMetadata(encoded);
  }

  throw new Error('Unsupported file type');
}

export async function exportBoardPng(
  element: HTMLElement,
  project: ProjectState,
  scale = 2,
): Promise<void> {
  const { toPng } = await import('html-to-image');
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: scale,
    style: {
      transform: 'none',
    },
  });

  const enriched = embedTextInPngDataUrl(
    dataUrl,
    EMBED_KEY,
    embedProjectInPngMetadata(project),
  );
  const anchor = document.createElement('a');
  anchor.href = enriched;
  anchor.download = `argumentationswaage-${formatStamp()}.png`;
  anchor.click();
}

export function isPngWithProject(bytes: Uint8Array): boolean {
  return extractTextFromPngBytes(bytes, EMBED_KEY) !== null;
}

export { dataUrlToBytes };

function formatStamp(): string {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace(/[:T]/g, '-');
}

export function printBoard(): void {
  window.print();
}
