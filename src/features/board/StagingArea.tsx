import { useTranslation } from '@/i18n';
import { useProjectStore } from '@/store/useProjectStore';
import { ArgumentCard } from './ArgumentCard';
import { DropZone } from './DropZone';

export function StagingArea() {
  const { t } = useTranslation();
  const argumentsList = useProjectStore((state) => state.arguments);
  const stagingItems = argumentsList.filter((item) => item.side === 'staging');

  return (
    <section className="staging-panel">
      <div className="tool-panel-heading">
        <h2>{t('staging')}</h2>
        <span className="tool-panel-count">{stagingItems.length}</span>
      </div>
      <DropZone id="staging" className="staging">
        {stagingItems.length === 0 ? (
          <div className="staging-empty">
            <p className="staging-empty-title">{t('stagingEmptyTitle')}</p>
            <p className="staging-empty-text">{t('stagingEmptyText')}</p>
          </div>
        ) : (
          <div className="staging-list">
            {stagingItems.map((item) => (
              <ArgumentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </DropZone>
    </section>
  );
}
