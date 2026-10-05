import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CardArtwork } from '../../components/CardArtwork';
import { ErrorState, LoadingState } from '../../components/QueryState';
import { useCard, useSettings } from '../../data/hooks';
import { getLocalizedCard, getText } from '../../lib/i18n';

type CardNavigationState = {
  reversed?: boolean;
  positionLabel?: string;
  positionMeaning?: string;
};

export function CardDetailPage() {
  const { cardId } = useParams();
  const { data: card, isPending, error } = useCard(cardId);
  const { data: settings } = useSettings();
  const t = getText(settings?.language);
  const localizedCard = card ? getLocalizedCard(card, settings?.language) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as CardNavigationState;
  const [orientation, setOrientation] = useState<'upright' | 'reversed'>(
    state.reversed ? 'reversed' : 'upright',
  );

  if (isPending) {
    return <LoadingState label={t.cards.loadingMeaning} />;
  }
  if (error) {
    return <ErrorState error={error} />;
  }
  if (!card || !localizedCard) {
    return (
      <section className="content-page">
        <p className="eyebrow">{t.cards.notFound}</p>
        <h1>{t.cards.missing}</h1>
        <Link className="text-link" to="/cards">
          {t.cards.returnToLibrary}
        </Link>
      </section>
    );
  }

  const keywords = localizedCard.keywords[orientation];
  const meaning = localizedCard.meaning[orientation];

  return (
    <article className="card-detail-page">
      <button className="back-link" type="button" onClick={() => navigate(-1)}>
        <span aria-hidden="true">←</span> {t.cards.back}
      </button>
      <p className="eyebrow">
        {localizedCard.arcana === 'major' ? t.cards.majorArcanaLabel : `${localizedCard.suit?.toUpperCase()} · ${t.cards.minorArcanaLabel}`}
      </p>
      <h1>{localizedCard.name}</h1>
      <div className="card-detail-hero">
        <CardArtwork card={localizedCard} className={state.reversed ? 'is-reversed' : ''} />
        <div className="card-detail-copy">
          {state.positionLabel && (
            <section className="position-insight">
              <p className="eyebrow">{state.positionLabel.toUpperCase()}</p>
              <p>{state.positionMeaning}</p>
            </section>
          )}
          <div className="orientation-badge" data-orientation={orientation}>
            <span aria-hidden="true">{orientation === 'upright' ? '↑' : '↓'}</span>
            {orientation}
          </div>
          <div className="keyword-list">
            {keywords.map((keyword) => (
              <span className="keyword-chip" key={keyword}>
                {keyword}
              </span>
            ))}
          </div>
          <div className="meaning-tabs" role="tablist" aria-label="Card orientation">
            {(['upright', 'reversed'] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={orientation === value}
                className={orientation === value ? 'is-selected' : ''}
                onClick={() => setOrientation(value)}
              >
                {value === 'upright' ? t.cards.orientation : t.cards.reversed}
              </button>
            ))}
          </div>
          <section className="card-meaning">
            <p className="eyebrow">{orientation.toUpperCase()} {t.cards.positionLabel}</p>
            <h2>
              {orientation === 'upright' ? t.cards.uprightMeaning : t.cards.reversedMeaning}
            </h2>
            <p>{meaning}</p>
          </section>
        </div>
      </div>
    </article>
  );
}
