import { useEffect } from 'react';
import { BoardWorkspace } from '@/features/board/BoardWorkspace';
import { AppToolbar } from '@/features/settings/AppToolbar';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTranslation } from '@/i18n';
import '@/features/settings/app.css';

export function App() {
  const colorTheme = useSettingsStore((state) => state.colorTheme);
  const patternsActive = useSettingsStore((state) => state.patternsActive);
  const { t } = useTranslation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', colorTheme === 'dark');
    document.body.classList.toggle('patterns', patternsActive);
  }, [colorTheme, patternsActive]);

  return (
    <div className="app-shell">
      <AppToolbar />
      <main className="app-main">
        <BoardWorkspace />
        <section className="howto-panel no-print">
          <div>
            <h2>{t('howToTitle')}</h2>
            <p>{t('howToText')}</p>
          </div>
          <p className="muted">{t('markdownHint')}</p>
        </section>
        <footer className="app-footer no-print muted">
          <p>
            <strong>{t('dataPrivacyTitle')}:</strong> {t('dataPrivacyText')}
          </p>
          <p>
            <strong>{t('imprintTitle')}:</strong> {t('imprintText')}
          </p>
        </footer>
      </main>
    </div>
  );
}
