import { motion, useReducedMotion } from 'framer-motion';
import type { Reading, Spread } from '@tarot/shared';
import { Link } from 'react-router-dom';
import { CardArtwork } from '../../../components/CardArtwork';
import { ErrorState, LoadingState, PageTitle } from '../../../components/QueryState';
import { useCards, useSettings } from '../../../data/hooks';
import { getLocalizedCard, getText } from '../../../lib/i18n';

export function DrawStep({
  spread,
  reading,
  revealedCount,
  onShuffle,
  onDraw,
  onDrawAll,
}: {
  spread: Spread;
  reading: Reading;
  revealedCount: number;
  onShuffle: () => void;
  onDraw: () => void;
  onDrawAll: () => void;
}) {
  const { data: cards, isPending, error } = useCards();
  const { data: settings } = useSettings();
  const t = getText(settings?.language);
  const systemReducedMotion = useReducedMotion();
  const reduceMotion = systemReducedMotion || settings?.reducedMotion;
  const cardById = new Map(
    (cards ?? []).map((card) => [card.id, getLocalizedCard(card, settings?.language)]),
  );

  return (
    <div className="draw-step">
      <PageTitle
        eyebrow={t.reading.drawYourCards.toUpperCase()}
        title={revealedCount === 0 ? 'Make space for a new perspective.' : 'Draw at your own pace.'}
        description={t.reading.readingSummary
          .replace('{count}', String(revealedCount))
          .replace('{total}', String(spread.positions.length))}
      />
      {isPending ? (
        <LoadingState label="Preparing the deck…" />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <>
          {revealedCount === 0 && (
            <div className="deck-stage">
              <motion.button
                className="deck-button"
                type="button"
                onClick={onDraw}
                aria-label={`Draw ${spread.positions[0]?.label ?? 'next'} card`}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              >
                <motion.img
                  key={`deck-${revealedCount}`}
                  src="/cards/card-back.webp"
                  alt=""
                  width="400"
                  height="640"
                  animate={
                    reduceMotion
                      ? { opacity: 1 }
                      : { rotate: [0, -3, 3, -2, 0], y: [0, -8, 2, -5, 0] }
                  }
                  transition={{
                    duration: reduceMotion ? 0.01 : 2.4,
                    repeat: reduceMotion ? 0 : Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.button>
              <p className="deck-caption">
                {revealedCount === 0 ? t.reading.ready : 'Choose a card to reveal'}
              </p>
              <div className="draw-actions">
                <button className="primary-button" type="button" onClick={onDraw}>
                  {t.reading.drawACard} <span aria-hidden="true">→</span>
                </button>
                {spread.positions.length > 1 && (
                  <button className="secondary-button" type="button" onClick={onDrawAll}>
                    {t.reading.drawAll} {spread.positions.length}
                  </button>
                )}
                <button className="text-button" type="button" onClick={onShuffle}>
                  {t.reading.shuffleAgain}
                </button>
              </div>
            </div>
          )}
          {revealedCount > 0 && (
            <>
              <div className="revealed-cards">
                {reading.cards.slice(0, revealedCount).map((drawn, index) => {
                  const card = cardById.get(drawn.cardId);
                  const position = spread.positions[drawn.position];
                  if (!card || !position) {
                    return null;
                  }
                  return (
                    <motion.article
                      className="revealed-card"
                      key={drawn.cardId}
                      initial={{
                        opacity: 0,
                        y: reduceMotion ? 0 : 24,
                        rotateY: reduceMotion ? 0 : 80,
                      }}
                      animate={{ opacity: 1, y: 0, rotateY: 0 }}
                      transition={{
                        duration: reduceMotion ? 0.01 : 0.45,
                        delay: reduceMotion ? 0 : index * 0.04,
                      }}
                    >
                      <p className="eyebrow">{position.label.toUpperCase()}</p>
                      <Link
                        className="drawn-card-link"
                        to={`/cards/${card.id}`}
                        state={{
                          reversed: drawn.reversed,
                          positionLabel: position.label,
                          positionMeaning: position.meaning,
                        }}
                      >
                        <CardArtwork card={card} className={drawn.reversed ? 'is-reversed' : ''} />
                        <span>{card.name}</span>
                      </Link>
                      <span
                        className="orientation-badge"
                        data-orientation={drawn.reversed ? 'reversed' : 'upright'}
                      >
                        {drawn.reversed ? '↓ Reversed' : '↑ Upright'}
                      </span>
                    </motion.article>
                  );
                })}
                {reading.cards.slice(revealedCount).map((drawn) => {
                  const position = spread.positions[drawn.position];
                  return (
                    <div className="face-down-card" key={drawn.cardId}>
                      <p className="eyebrow">{position?.label.toUpperCase()}</p>
                      <img
                        src="/cards/card-back.webp"
                        alt="Face-down card"
                        width="400"
                        height="640"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="draw-actions">
                {revealedCount < reading.cards.length ? (
                  <>
                    <button className="primary-button" type="button" onClick={onDraw}>
                      {t.reading.drawNextCard} <span aria-hidden="true">→</span>
                    </button>
                    <button className="secondary-button" type="button" onClick={onDrawAll}>
                      {t.reading.drawRemaining} {reading.cards.length - revealedCount}
                    </button>
                  </>
                ) : (
                  <p className="all-revealed-label">{t.reading.allRevealed}</p>
                )}
                <button className="text-button" type="button" onClick={onShuffle}>
                  {t.reading.shuffleReset}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
