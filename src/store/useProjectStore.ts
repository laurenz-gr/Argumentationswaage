import { create } from 'zustand';
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

  return Array.from(usedColors).map((colorId) => ({
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

export const useProjectStore = create<ProjectStore>((set, get) => ({
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

  getSnapshot: () => {
    const { version, proTitle, contraTitle, arguments: args, legend } = get();
    return { version, proTitle, contraTitle, arguments: args, legend };
  },
}));
