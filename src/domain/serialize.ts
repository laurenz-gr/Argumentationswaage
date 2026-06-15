import type { ProjectState } from './model';
import { createEmptyProject } from './model';

export const PROJECT_FILE_EXTENSION = '.argumentationswaage.json';
export const PROJECT_MIME = 'application/json';
export const EMBED_KEY = 'argumentationswaage';

export interface SerializedProject {
  schemaVersion: 1;
  exportedAt: string;
  project: ProjectState;
}

export function serializeProject(project: ProjectState): string {
  const payload: SerializedProject = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    project,
  };
  return JSON.stringify(payload, null, 2);
}

export function deserializeProject(raw: string): ProjectState {
  const parsed = JSON.parse(raw) as SerializedProject | ProjectState;

  if ('schemaVersion' in parsed && parsed.schemaVersion === 1) {
    return normalizeProject(parsed.project);
  }

  return normalizeProject(parsed as ProjectState);
}

export function normalizeProject(project: ProjectState): ProjectState {
  const base = createEmptyProject();
  return {
    ...base,
    ...project,
    version: 1,
    arguments: project.arguments.map((item) => ({
      ...item,
      text: item.text ?? '',
      colorId: item.colorId ?? 'default',
      side: item.side ?? 'staging',
      weight: item.weight ?? null,
    })),
    legend: project.legend ?? [],
  };
}

export function downloadTextFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function readFileAsText(file: File): Promise<string> {
  return file.text();
}

export function embedProjectInPngMetadata(project: ProjectState): string {
  return btoa(unescape(encodeURIComponent(serializeProject(project))));
}

export function extractProjectFromPngMetadata(encoded: string): ProjectState {
  return deserializeProject(decodeURIComponent(escape(atob(encoded))));
}
