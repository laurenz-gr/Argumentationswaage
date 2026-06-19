import { useTranslation } from '@/i18n';
import { useProjectStore } from '@/store/useProjectStore';
import { argumentColorStyle } from './argumentColors';

export function LegendPanel() {
  const { t } = useTranslation();
  const legend = useProjectStore((state) => state.legend);
  const argumentsList = useProjectStore((state) => state.arguments);
  const updateLegendLabel = useProjectStore((state) => state.updateLegendLabel);

  const usedColors = new Set(argumentsList.map((item) => item.colorId));
  const visibleLegend = legend.filter((entry) => usedColors.has(entry.colorId));

  if (visibleLegend.length === 0) {
    return null;
  }

  return (
    <section className="legend-panel">
      <div className="tool-panel-heading">
        <h2>{t('legend')}</h2>
      </div>
      <div className="legend-list">
        {visibleLegend.map((entry) => (
          <label key={entry.colorId} className="legend-row">
            <span
              className="color-swatch"
              style={argumentColorStyle(entry.colorId)}
              aria-hidden="true"
            />
            <input
              className="input"
              value={entry.label}
              placeholder={t('legendPlaceholder')}
              onChange={(event) =>
                updateLegendLabel(entry.colorId, event.target.value)
              }
            />
          </label>
        ))}
      </div>
    </section>
  );
}
