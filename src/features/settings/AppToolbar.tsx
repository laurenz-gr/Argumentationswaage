import {
  Download,
  Image,
  Languages,
  Moon,
  Palette,
  Plus,
  Printer,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useTranslation } from '@/i18n';
import { useProjectStore } from '@/store/useProjectStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { pushToast, useToast } from '@/hooks/useToast';
import { ToastStack } from '@/components/ui/ToastStack';
import {
  exportBoardPng,
  exportProjectJson,
  importProjectFromFile,
  printBoard,
} from '@/features/export/exportService';

export function AppToolbar() {
  const { t, language } = useTranslation();
  const zenMode = useSettingsStore((state) => state.zenMode);
  const patternsActive = useSettingsStore((state) => state.patternsActive);
  const colorTheme = useSettingsStore((state) => state.colorTheme);
  const toggleZenMode = useSettingsStore((state) => state.toggleZenMode);
  const togglePatterns = useSettingsStore((state) => state.togglePatterns);
  const toggleColorTheme = useSettingsStore((state) => state.toggleColorTheme);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  const addArgument = useProjectStore((state) => state.addArgument);
  const clearAll = useProjectStore((state) => state.clearAll);
  const importProject = useProjectStore((state) => state.importProject);
  const getSnapshot = useProjectStore((state) => state.getSnapshot);

  const { messages } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportScale, setExportScale] = useState(2);

  const handleLoad = async (file: File) => {
    try {
      const project = await importProjectFromFile(file);
      importProject(project);
      pushToast(t('importSuccess'));
    } catch {
      pushToast(t('importError'), true);
    }
  };

  const handleExportJson = async () => {
    await exportProjectJson(getSnapshot());
    pushToast(t('exportSuccess'));
  };

  const handleExportPng = async () => {
    const root = document.getElementById('board-export-root');
    if (!root) {
      return;
    }
    await exportBoardPng(root, getSnapshot(), exportScale);
    pushToast(t('exportSuccess'));
    setExportOpen(false);
  };

  return (
    <>
      <header className={`toolbar no-print${zenMode ? ' sr-only' : ''}`}>
        <div className="toolbar-brand">
          <h1 className="display-title">{t('appTitle')}</h1>
          <p className="muted">{t('appSubtitle')}</p>
        </div>
        <div className="toolbar-actions">
          <div className="toolbar-group toolbar-group-primary" aria-label="Argumente">
            <Button variant="primary" onClick={() => addArgument()}>
              <Plus size={18} />
              <span>{t('addArgument')}</span>
            </Button>
          </div>

          <div className="toolbar-group" aria-label="Dateien">
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload size={18} />
              <span>{t('loadProject')}</span>
            </Button>
            <Button onClick={handleExportJson}>
              <Download size={18} />
              <span>{t('saveProject')}</span>
            </Button>
            <Button onClick={() => setExportOpen(true)}>
              <Image size={18} />
              <span>{t('exportImage')}</span>
            </Button>
            <Button onClick={printBoard}>
              <Printer size={18} />
              <span>{t('print')}</span>
            </Button>
          </div>

          <div className="toolbar-group toolbar-group-compact" aria-label="Ansicht">
            <Button variant="ghost" onClick={() => setClearOpen(true)}>
              <Trash2 size={18} />
              <span>{t('clearAll')}</span>
            </Button>
            <Button
              variant="ghost"
              iconOnly
              aria-label={zenMode ? t('zenOff') : t('zenOn')}
              onClick={toggleZenMode}
            >
              {zenMode ? <Eye size={18} /> : <EyeOff size={18} />}
            </Button>
            <Button
              variant="ghost"
              iconOnly
              aria-label={patternsActive ? t('patternsOff') : t('patternsOn')}
              onClick={togglePatterns}
            >
              <Palette size={18} />
            </Button>
            <Button
              variant="ghost"
              iconOnly
              aria-label={colorTheme === 'light' ? t('themeDark') : t('themeLight')}
              onClick={toggleColorTheme}
            >
              {colorTheme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </Button>
            <Button
              variant="ghost"
              iconOnly
              aria-label={t('language')}
              onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
            >
              <Languages size={18} />
            </Button>
          </div>
        </div>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept=".argumentationswaage.json,application/json,image/png"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleLoad(file);
          }
          event.currentTarget.value = '';
        }}
      />

      <Modal
        open={clearOpen}
        title={t('confirmClearTitle')}
        description={t('confirmClearText')}
        onClose={() => setClearOpen(false)}
        actions={
          <>
            <Button variant="ghost" onClick={() => setClearOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clearAll();
                setClearOpen(false);
              }}
            >
              {t('confirm')}
            </Button>
          </>
        }
      />

      <Modal
        open={exportOpen}
        title={t('exportModalTitle')}
        onClose={() => setExportOpen(false)}
        actions={
          <>
            <Button variant="ghost" onClick={() => setExportOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="primary" onClick={() => void handleExportPng()}>
              <Sparkles size={18} />
              {t('downloadImage')}
            </Button>
          </>
        }
      >
        <label className="stack">
          <span className="muted">{t('size')}</span>
          <select
            className="select"
            value={exportScale}
            onChange={(event) => setExportScale(Number(event.target.value))}
          >
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={3}>3x</option>
          </select>
        </label>
      </Modal>

      <ToastStack messages={messages} />
    </>
  );
}
