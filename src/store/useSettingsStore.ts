import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SettingsState } from './settingsTypes';
import { defaultSettings } from './settingsTypes';

interface SettingsStore extends SettingsState {
  setLanguage: (language: SettingsState['language']) => void;
  toggleColorTheme: () => void;
  togglePatterns: () => void;
  toggleZenMode: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      setLanguage: (language) => set({ language }),
      toggleColorTheme: () =>
        set({ colorTheme: get().colorTheme === 'light' ? 'dark' : 'light' }),
      togglePatterns: () => set({ patternsActive: !get().patternsActive }),
      toggleZenMode: () => set({ zenMode: !get().zenMode }),
    }),
    {
      name: 'argumentationswaage-settings',
    },
  ),
);
