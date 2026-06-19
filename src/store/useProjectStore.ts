import { create, useStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import type {
  ArgumentColorId,
  ArgumentItem,
  ArgumentSide,
  ArgumentWeight,
  LegendEntry,
  ProjectState,
} from '@/domain/model';
import {
  createArgument,
  createEmptyProject,
  parseDropZoneId,
  type DropZoneId,
} from '@/domain/model';
import { deserializeProject, normalizeProject } from '@/domain/serialize';

export const PROJECT_STORAGE_KEY = 'argumentationswaage-project';
const HISTORY_LIMIT = 50;

// Storage mit In-Memory-Fallback: localStorage kann fehlen (Tests/SSR) oder
// Ausnahmen werfen (Safari-Privatmodus, volle Quota). Dann darf die App nicht abstürzen.
const memoryStore = new Map<string, string>();

const safeStorage = {
  getItem: (name: string): string | null => {
    try {
      return globalThis.localStorage?.getItem(name) ?? memoryStore.get(name) ?? null;
    } catch {
      return memoryStore.get(name) ?? null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      globalThis.localStorage?.setItem(name, value);
    } catch {
      memoryStore.set(name, value);
    }
  },
  removeItem: (name: string): void => {
    try {
      globalThis.localStorage?.removeItem(name);
    } catch {
      memoryStore.delete(name);
    }
  },
};

interface ProjectStore extends ProjectState {
  addArgument: (text?: string) => void;
  updateArgumentText: (id: string, text: string) => void;
  setArgumentColor: (id: string, colorId: ArgumentColorId) => void;
  moveArgumentToZone: (id: string, zoneId: DropZoneId) => void;
  deleteArgument: (id: string) => void;
  duplicateArgument: (id: string) => void;
  setProTitle: (title: string) => void;
  setContraTitle: (title: string) => void;
  updateLegendLabel: (colorId: ArgumentColorId, label: string) => void;
  clearAll: () => void;
  importProject: (project: ProjectState) => void;
  importProjectFromJson: (raw: string) => void;
  getSnapshot: () => ProjectState;
}

function syncLegend(state: ProjectState): LegendEntry[] {
  const usedColors = new Set(
    state.arguments
      .filter((item) => item.colorId !== 'default')
      .map((item) => item.colorId),
  );

  const existing = new Map(state.legend.map((entry) => [entry.colorId, entry.label]));

  // Behalte Eintrag, wenn die Farbe aktuell genutzt wird ODER bereits ein
  // Label hat – so geht eine Beschriftung beim Umfärben/Löschen nicht verloren.
  const colors = new Set<ArgumentColorId>(usedColors);
  for (const [colorId, label] of existing) {
    if (label.trim().length > 0) {
      colors.add(colorId);
    }
  }

  return Array.from(colors).map((colorId) => ({
    colorId,
    label: existing.get(colorId) ?? '',
  }));
}

function placeArgument(
  item: ArgumentItem,
  side: ArgumentSide,
  weight: ArgumentWeight | null,
): ArgumentItem {
  if (side === 'staging' || weight === null) {
    return { ...item, side: 'staging', weight: null };
  }
  return { ...item, side, weight };
}

function projectData(state: ProjectState): ProjectState {
  return {
    version: state.version,
    proTitle: state.proTitle,
    contraTitle: state.contraTitle,
    arguments: state.arguments,
    legend: state.legend,
  };
}

export const useProjectStore = create<ProjectStore>()(
  temporal(
    persist(
      (set, get) => ({
        ...createEmptyProject(),

  addArgument: (text = '') =>
    set((state) => ({
      arguments: [...state.arguments, createArgument(text)],
    })),

  updateArgumentText: (id, text) =>
    set((state) => ({
      arguments: state.arguments.map((item) =>
        item.id === id ? { ...item, text } : item,
      ),
    })),

  setArgumentColor: (id, colorId) =>
    set((state) => {
      const next = {
        ...state,
        arguments: state.arguments.map((item) =>
          item.id === id ? { ...item, colorId } : item,
        ),
      };
      return { ...next, legend: syncLegend(next) };
    }),

  moveArgumentToZone: (id, zoneId) => {
    if (zoneId === 'trash') {
      get().deleteArgument(id);
      return;
    }

    const { side, weight } = parseDropZoneId(zoneId);
    set((state) => {
      const next = {
        ...state,
        arguments: state.arguments.map((item) =>
          item.id === id ? placeArgument(item, side, weight) : item,
        ),
      };
      return { ...next, legend: syncLegend(next) };
    });
  },

  deleteArgument: (id) =>
    set((state) => {
      const next = {
        ...state,
        arguments: state.arguments.filter((item) => item.id !== id),
      };
      return { ...next, legend: syncLegend(next) };
    }),

  duplicateArgument: (id) =>
    set((state) => {
      const source = state.arguments.find((item) => item.id === id);
      if (!source) {
        return state;
      }
      const copy = { ...source, id: crypto.randomUUID() };
      const index = state.arguments.findIndex((item) => item.id === id);
      const argumentsList = [...state.arguments];
      argumentsList.splice(index + 1, 0, copy);
      const next = { ...state, arguments: argumentsList };
      return { ...next, legend: syncLegend(next) };
    }),

  setProTitle: (proTitle) => set({ proTitle }),
  setContraTitle: (contraTitle) => set({ contraTitle }),

  updateLegendLabel: (colorId, label) =>
    set((state) => {
      const legend = [...state.legend];
      const index = legend.findIndex((entry) => entry.colorId === colorId);
      if (index >= 0) {
        legend[index] = { colorId, label };
      } else {
        legend.push({ colorId, label });
      }
      return { legend };
    }),

  clearAll: () => set(createEmptyProject()),

  importProject: (project) => set(normalizeProject(project)),

  importProjectFromJson: (raw) => set(normalizeProject(deserializeProject(raw))),

  getSnapshot: () => projectData(get()),
      }),
      {
        name: PROJECT_STORAGE_KEY,
        storage: createJSONStorage(() => safeStorage),
        partialize: (state) => projectData(state),
        merge: (persisted, current) => ({
          ...current,
          ...normalizeProject((persisted as ProjectState) ?? createEmptyProject()),
        }),
        onRehydrateStorage: () => () => {
          // Wiederherstellen darf nicht als Undo-Schritt zählen.
          useProjectStore.temporal.getState().clear();
        },
      },
    ),
    {
      limit: HISTORY_LIMIT,
      partialize: (state) => projectData(state),
      equality: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    },
  ),
);

export function undoProject(): void {
  useProjectStore.temporal.getState().undo();
}

export function redoProject(): void {
  useProjectStore.temporal.getState().redo();
}

export function useProjectHistory(): { canUndo: boolean; canRedo: boolean } {
  const canUndo = useStore(
    useProjectStore.temporal,
    (state) => state.pastStates.length > 0,
  );
  const canRedo = useStore(
    useProjectStore.temporal,
    (state) => state.futureStates.length > 0,
  );
  return { canUndo, canRedo };
}
