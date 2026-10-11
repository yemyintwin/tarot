import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ErrorState, PageTitle } from '../../components/QueryState';
import { spreads } from '../../content/spreads';
import { useCards, useSettings } from '../../data/hooks';
import { drawCards } from '../../lib/draw';
import { getText } from '../../lib/i18n';
import { useUiStore } from '../../store/uiStore';
import { ReadingResult } from './components/ReadingResult';
import { QuestionStep } from './components/QuestionStep';
import { DrawStep } from './components/DrawStep';

export function ReadingPage() {
  const { spreadId } = useParams();
  const spread = spreads.find((item) => item.id === spreadId);
  const cardsQuery = useCards();
  const settingsQuery = useSettings();
  const { data: settings } = settingsQuery;
  const t = getText(settings?.language);
  const cards = cardsQuery.data;
  const activeSpreadId = useUiStore((state) => state.activeSpreadId);
  const question = useUiStore((state) => state.question);
  const activeReading = useUiStore((state) => state.activeReading);
  const revealedCount = useUiStore((state) => state.revealedCount);
  const stage = useUiStore((state) => state.stage);
  const beginReading = useUiStore((state) => state.beginReading);
  const setQuestion = useUiStore((state) => state.setQuestion);
  const continueToDraw = useUiStore((state) => state.continueToDraw);
  const setDrawPlan = useUiStore((state) => state.setDrawPlan);
  const revealNext = useUiStore((state) => state.revealNext);
  const revealAll = useUiStore((state) => state.revealAll);
  const resetReading = useUiStore((state) => state.resetReading);

  useEffect(() => {
    if (spread && activeSpreadId !== spread.id) {
      beginReading(spread.id);
    }
  }, [spread, activeSpreadId, beginReading]);

  if (!spread) {
    return <Navigate to="/spreads" replace />;
  }
  const selectedSpread = spread;

  const flowIsCurrent = activeSpreadId === spread.id;
  const currentStage = flowIsCurrent ? stage : 'question';
  const currentQuestion = flowIsCurrent ? question : '';

  function shuffleDeck() {
    if (!cards || !settings) {
      return;
    }
    const createdAt = new Date().toISOString();
    const cardsToRead = drawCards(cards, selectedSpread.positions.length, settings.allowReversed);
    setDrawPlan({
      id: crypto.randomUUID(),
      createdAt,
      updatedAt: createdAt,
      spreadId: selectedSpread.id,
      question: currentQuestion.trim() || undefined,
      cards: cardsToRead,
    });
  }

  return (
    <section className="reading-flow content-page">
      <div className="reading-flow-top">
        <Link
          className="back-link"
          to={currentStage === 'question' ? '/spreads' : '#'}
          onClick={(event) => {
            if (currentStage !== 'question') {
              event.preventDefault();
              resetReading();
            }
          }}
        >
          <span aria-hidden="true">←</span>{' '}
          {currentStage === 'question' ? t.reading.allSpreads : t.reading.startOver}
        </Link>
        {currentStage !== 'question' && (
          <span className="reading-stage-label">
            {spread.name.toUpperCase()} ·{' '}
            {currentStage === 'result' ? t.reading.yourReading : t.reading.drawYourCards}
          </span>
        )}
      </div>
      <ErrorState error={cardsQuery.error ?? settingsQuery.error} />

      {currentStage === 'question' && (
        <QuestionStep
          spread={spread}
          question={currentQuestion}
          onQuestionChange={setQuestion}
          onContinue={continueToDraw}
        />
      )}
      {currentStage === 'draw' && activeReading && (
        <DrawStep
          spread={spread}
          reading={activeReading}
          revealedCount={flowIsCurrent ? revealedCount : 0}
          onShuffle={shuffleDeck}
          onDraw={revealNext}
          onDrawAll={revealAll}
        />
      )}
      {currentStage === 'result' && activeReading && (
        <ReadingResult
          reading={activeReading}
          onRedo={shuffleDeck}
          onSaved={() => resetReading(false)}
        />
      )}
      {currentStage === 'draw' && !activeReading && (
        <>
          <PageTitle eyebrow={t.reading.drawYourCards} title={t.reading.prepareDeck} />
          <button
            className="primary-button"
            type="button"
            onClick={shuffleDeck}
            disabled={!cards || !settings}
          >
            {t.reading.shuffleDeck}
          </button>
        </>
      )}
    </section>
  );
}
