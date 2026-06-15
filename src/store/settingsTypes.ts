export type Language = 'de' | 'en';
export type ColorTheme = 'light' | 'dark';

export interface SettingsState {
  language: Language;
  colorTheme: ColorTheme;
  patternsActive: boolean;
  zenMode: boolean;
}

export const defaultSettings: SettingsState = {
  language: 'de',
  colorTheme: 'light',
  patternsActive: false,
  zenMode: false,
};
