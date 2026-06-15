import { calculateBalance } from '@/domain/balance';
import type { ArgumentItem, ArgumentWeight } from '@/domain/model';
import { WEIGHTS } from '@/domain/model';
import { useTranslation } from '@/i18n';
import { useProjectStore } from '@/store/useProjectStore';
import { ArgumentCard } from './ArgumentCard';
import { DropZone } from './DropZone';

function argumentsInZone(
  argumentsList: ArgumentItem[],
  side: 'pro' | 'contra' | 'staging',
  weight: ArgumentWeight | null,
) {
  return argumentsList.filter((item) => {
    if (side === 'staging') {
      return item.side === 'staging';
    }
    return item.side === side && item.weight === weight;
  });
}

export function SeesawBoard() {
  const { t } = useTranslation();
  const argumentsList = useProjectStore((state) => state.arguments);
  const proTitle = useProjectStore((state) => state.proTitle);
  const contraTitle = useProjectStore((state) => state.contraTitle);
  const setProTitle = useProjectStore((state) => state.setProTitle);
  const setContraTitle = useProjectStore((state) => state.setContraTitle);
  const balance = calculateBalance(argumentsList);

  return (
    <section className="panel seesaw-panel" id="board-export-root">
      <div className="seesaw-header">
        <input
          className="input side-title-input contra"
          value={contraTitle}
          onChange={(event) => setContraTitle(event.target.value)}
          aria-label={t('contra')}
        />
        <span className="chip" aria-live="polite">
          {balance.netScore >= 0 ? '+' : ''}
          {balance.netScore}
        </span>
        <input
          className="input side-title-input pro"
          value={proTitle}
          onChange={(event) => setProTitle(event.target.value)}
          aria-label={t('pro')}
        />
      </div>

      <div className="seesaw-visual">
        <div className="seesaw-beam-wrap">
          <div
            className="seesaw-beam"
            style={{ transform: `rotate(${balance.tiltDegrees}deg)` }}
            aria-hidden="true"
          />
          <div className="seesaw-fulcrum" aria-hidden="true" />
          <div className="seesaw-columns">
            {WEIGHTS.map((weight) => (
              <div key={`contra-${weight}`} className="weight-column">
                <DropZone
                  id={`contra-${weight}`}
                  label={`-${weight}`}
                  className="contra"
                >
                  {argumentsInZone(argumentsList, 'contra', weight).map((item) => (
                    <ArgumentCard key={item.id} item={item} />
                  ))}
                </DropZone>
              </div>
            ))}
            <div />
            {WEIGHTS.map((weight) => (
              <div key={`pro-${weight}`} className="weight-column">
                <DropZone id={`pro-${weight}`} label={`+${weight}`} className="pro">
                  {argumentsInZone(argumentsList, 'pro', weight).map((item) => (
                    <ArgumentCard key={item.id} item={item} />
                  ))}
                </DropZone>
              </div>
            ))}
          </div>
        </div>
        <div className="export-branding print-only">{t('createdWith')}</div>
      </div>
    </section>
  );
}
