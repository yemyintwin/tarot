import { Link } from 'react-router-dom';
import { PageTitle } from '../../components/QueryState';
import { spreads } from '../../content/spreads';
import { useSettings } from '../../data/hooks';
import { getText } from '../../lib/i18n';

const spreadArt = {
  'one-card': ['✧'],
  'three-card': ['☾', '✧', '☼'],
  'celtic-cross': ['✧', '◈', '☾', '☼', '✣', '◇', '✦', '☽', '⊙', '✧'],
};

export function SpreadsPage() {
  const { data: settings } = useSettings();
  const t = getText(settings?.language);

  return (
    <section className="content-page">
      <PageTitle
        eyebrow={t.spreads.eyebrow}
        title={t.spreads.title}
        description={t.spreads.description}
      />
      <div className="spread-list">
        {spreads.map((spread) => (
          <article className="spread-card" key={spread.id}>
            <div className={`spread-diagram spread-diagram-${spread.id}`} aria-hidden="true">
              {spread.positions.map((position, index) => (
                <span
                  className="diagram-card"
                  key={position.index}
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                  aria-hidden="true"
                >
                  {spreadArt[spread.id as keyof typeof spreadArt]?.[index] ?? '✧'}
                </span>
              ))}
            </div>
            <div className="spread-card-copy">
              <p className="eyebrow">
                {spread.positions.length} {spread.positions.length === 1 ? 'CARD' : 'CARDS'}
              </p>
              <h2>{spread.name}</h2>
              <p>{spread.description}</p>
              <ol className="spread-position-list">
                {spread.positions.slice(0, 4).map((position) => (
                  <li key={position.index}>{position.label}</li>
                ))}
                {spread.positions.length > 4 && (
                  <li>
                    + {spread.positions.length - 4} {t.spreads.morePositions}
                  </li>
                )}
              </ol>
            </div>
            <Link className="primary-button spread-start" to={`/reading/${spread.id}`}>
              {t.spreads.chooseSpread} <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
