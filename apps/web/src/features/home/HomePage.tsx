import { Link } from 'react-router-dom';
import { CardArtwork } from '../../components/CardArtwork';
import { ErrorState, LoadingState } from '../../components/QueryState';
import { useCards, useReadings, useSettings } from '../../data/hooks';
import { spreads } from '../../content/spreads';
import { getText } from '../../lib/i18n';

export function HomePage() {
  const cardsQuery = useCards();
  const readingsQuery = useReadings();
  const { data: settings } = useSettings();
  const t = getText(settings?.language);
  const cardById = new Map((cardsQuery.data ?? []).map((card) => [card.id, card]));
  const titleLines = t.home.title.split(/(?:\n|,\s*)/).filter(Boolean);

  return (
    <div className="home-page">
      <section className="home-welcome">
        <div>
          <p className="eyebrow">{t.home.eyebrow}</p>
          <h1>
            {titleLines[0]}
            {titleLines[1] ? (
              <>
                ,
                <br />
                {titleLines[1]}
              </>
            ) : null}
          </h1>
          <p className="page-description">{t.home.description}</p>
        </div>
        <Link className="primary-button" to="/spreads">
          <span aria-hidden="true">✧</span> {t.home.begin}
        </Link>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t.home.choosePerspective}</p>
            <h2>{t.home.chooseReading}</h2>
          </div>
          <Link className="text-link" to="/spreads">
            {t.home.seeAllSpreads} <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="spread-shortcuts">
          {spreads.slice(0, 3).map((spread, index) => (
            <Link
              className={`spread-shortcut spread-shortcut-${index + 1}`}
              key={spread.id}
              to={`/reading/${spread.id}`}
            >
              <span className="shortcut-symbol" aria-hidden="true">
                {['✧', '◈', '✣'][index]}
              </span>
              <span className="shortcut-title">{spread.name}</span>
              <span className="shortcut-subtitle">
                {spread.positions.length} card{spread.positions.length === 1 ? '' : 's'} ·{' '}
                {spread.description}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{settings?.language === 'my' ? 'သင့်အချက်အလက်' : 'YOUR PERSONAL SPACE'}</p>
            <h2>{t.home.recentReadings}</h2>
          </div>
          <Link className="text-link" to="/journal">
            {t.home.openJournal} <span aria-hidden="true">↗</span>
          </Link>
        </div>
        {readingsQuery.isPending ? (
          <LoadingState label={t.home.findingRecent} />
        ) : readingsQuery.isError ? (
          <ErrorState error={readingsQuery.error} />
        ) : readingsQuery.data.length === 0 ? (
          <div className="empty-state">
            <span className="placeholder-symbol" aria-hidden="true">
              ✧
            </span>
            <p>{t.home.savedReadings}</p>
            <Link className="text-link" to="/spreads">
              {t.home.startFirstReading}
            </Link>
          </div>
        ) : (
          <div className="recent-reading-list">
            {readingsQuery.data.slice(0, 3).map((reading) => {
              const spread = spreads.find((item) => item.id === reading.spreadId);
              const firstCard = cardById.get(reading.cards[0]?.cardId);
              return (
                <Link
                  className="recent-reading"
                  key={reading.id}
                  to={`/reading/saved/${reading.id}`}
                >
                  {firstCard && <CardArtwork card={firstCard} />}
                  <span className="recent-reading-copy">
                    <span className="recent-reading-title">{spread?.name ?? 'Reading'}</span>
                    <span className="recent-reading-meta">
                      {new Date(reading.createdAt).toLocaleDateString()} · {reading.cards.length}{' '}
                      card{reading.cards.length === 1 ? '' : 's'}
                    </span>
                    {reading.question && (
                      <span className="recent-reading-question">{reading.question}</span>
                    )}
                  </span>
                  <span className="recent-reading-arrow" aria-hidden="true">
                    ↗
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {cardsQuery.isError && <ErrorState error={cardsQuery.error} />}
      <p className="disclaimer">{t.home.disclaimer}</p>
    </div>
  );
}
