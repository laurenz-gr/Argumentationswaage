import { useSettingsStore } from '@/store/useSettingsStore';
import { de, type TranslationKey } from './de';
import { en } from './en';

const dictionaries = { de, en } as const;

export function useTranslation() {
  const language = useSettingsStore((state) => state.language);
  const dictionary = dictionaries[language];

  const t = (key: TranslationKey): string => dictionary[key];

  return { t, language };
}
