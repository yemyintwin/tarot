import { ReadingSchema, type InterpretationRequest, type Reading } from '@tarot/shared';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CardArtwork } from '../../../components/CardArtwork';
import { ErrorState } from '../../../components/QueryState';
import {
  useCards,
  useInterpretReading,
  useSaveReading,
  useSettings,
  useUpdateReading,
} from '../../../data/hooks';
import { spreads } from '../../../content/spreads';
import { getLocalizedCard, getText } from '../../../lib/i18n';
import { MAX_REFLECTION_REGENERATIONS, useUiStore } from '../../../store/uiStore';

export function ReadingResult({
  reading,
  isSaved = false,
  onRedo,
  onSaved,
}: {
  reading: Reading;
  isSaved?: boolean;
  onRedo?: () => void;
  onSaved?: () => void;
}) {
  const navigate = useNavigate();
  const { data: cards = [] } = useCards();
  const { data: settings } = useSettings();
  const t = getText(settings?.language);
  const saveReading = useSaveReading();
  const updateReading = useUpdateReading();
  const interpretationMutation = useInterpretReading();
  const interpretation = useUiStore((state) => state.interpretations[reading.id]);
  const beginInterpretation = useUiStore((state) => state.beginInterpretation);
  const setInterpretation = useUiStore((state) => state.setInterpretation);
  const failInterpretation = useUiStore((state) => state.failInterpretation);
  const isGenerating = Boolean(interpretation?.isPending || interpretationMutation.isPending);
  const [notes, setNotes] = useState(reading.notes ?? '');
  const [feedback, setFeedback] = useState('');
  const spread = spreads.find((item) => item.id === reading.spreadId);
  const cardById = useMemo(
    () => new Map(cards.map((card) => [card.id, getLocalizedCard(card, settings?.language)])),
    [cards, settings?.language],
  );
  const mutation = isSaved ? updateReading : saveReading;
  const regenerationCountSuffix =
    interpretation &&
    interpretation.regenerationsUsed > 0 &&
    interpretation.regenerationsUsed < MAX_REFLECTION_REGENERATIONS
      ? ` (${interpretation.regenerationsUsed} ${
          interpretation.regenerationsUsed === 1
            ? t.reading.reflectionTimeSingular
            : t.reading.reflectionTimePlural
        })`
      : '';

  useEffect(() => {
    setNotes(reading.notes ?? '');
    setFeedback('');
  }, [reading.id, reading.notes]);

  useEffect(() => {
    interpretationMutation.reset();
  }, [reading.id, interpretationMutation.reset]);

  async function saveNotes() {
    try {
      const updated = ReadingSchema.parse({
        ...reading,
        notes: notes.trim() || undefined,
        updatedAt: new Date().toISOString(),
      });
      await mutation.mutateAsync(updated);
      setFeedback(isSaved ? t.reading.noteSaved : t.reading.readingSaved);
      if (!isSaved) {
        onSaved?.();
        navigate(`/reading/saved/${reading.id}`, { replace: true });
      }
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? `Could not save this reading: ${error.message}`
          : 'Could not save this reading.',
      );
    }
  }

  function generateInterpretation() {
    if (
      !spread ||
      isGenerating ||
      (interpretation?.hasGenerated &&
        interpretation.regenerationsUsed >= MAX_REFLECTION_REGENERATIONS)
    ) {
      return;
    }
    if (!beginInterpretation(reading.id)) {
      return;
    }
    const interpretationCards = reading.cards.flatMap(
      (drawn): InterpretationRequest['cards'][number][] => {
        const card = cardById.get(drawn.cardId);
        const position = spread.positions[drawn.position];
        if (!card || !position) {
          return [];
        }
        return [
          {
            position: drawn.position,
            positionLabel: position.label,
            positionMeaning: position.meaning,
            name: card.name,
            orientation: drawn.reversed ? 'reversed' : 'upright',
            keywords: drawn.reversed ? card.keywords.reversed : card.keywords.upright,
            meaning: drawn.reversed ? card.meaning.reversed : card.meaning.upright,
          },
        ];
      },
    );

    interpretationMutation.mutate(
      {
        language: settings?.language === 'my' ? 'my' : 'en',
        question: reading.question,
        spread: {
          name: spread.name,
          positions: spread.positions.map(({ label, meaning }) => ({ label, meaning })),
        },
        cards: interpretationCards,
      },
      {
        onSuccess: (result) => setInterpretation(reading.id, result.interpretation),
        onError: () => failInterpretation(reading.id),
      },
    );
  }

  return (
    <article className="reading-result">
      <header className="result-heading">
        <p className="eyebrow">
          {spread?.name.toUpperCase() ?? t.reading.yourReading.toUpperCase()} · ALL CARDS REVEALED
        </p>
        <h1>{reading.question ? t.reading.questionStory : t.reading.questionMoment}</h1>
        {reading.question && <p className="result-question">“{reading.question}”</p>}
        <p className="page-description">{t.reading.revealPrompt}</p>
      </header>

      {spread && (
        <div className={`reading-layout${spread.id === 'celtic-cross' ? ' is-celtic-cross' : ''}`}>
          <div className="spread-layout-canvas" aria-label={`${spread.name} card layout`}>
            {reading.cards.map((drawn) => {
              const card = cardById.get(drawn.cardId);
              const position = spread.positions[drawn.position];
              if (!card || !position) {
                return null;
              }
              return (
                <article
                  className={`spread-position-card${drawn.position === 1 && spread.id === 'celtic-cross' ? ' is-crossing' : ''}`}
                  key={drawn.cardId}
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                  data-position={drawn.position}
                >
                  <p className="spread-position-label">{position.label}</p>
                  <Link
                    to={`/cards/${card.id}`}
                    state={{
                      reversed: drawn.reversed,
                      positionLabel: position.label,
                      positionMeaning: position.meaning,
                    }}
                    aria-label={`Open ${card.name}, ${drawn.reversed ? 'reversed' : 'upright'}, for ${position.label}`}
                  >
                    <CardArtwork card={card} className={drawn.reversed ? 'is-reversed' : ''} />
                  </Link>
                  <p className="spread-position-card-name">{card.name}</p>
                  <p className="spread-position-orientation">
                    {drawn.reversed ? '↓ Reversed' : '↑ Upright'}
                  </p>
                </article>
              );
            })}
          </div>

          <ol className="reading-result-list">
            {reading.cards.map((drawn) => {
              const card = cardById.get(drawn.cardId);
              const position = spread.positions[drawn.position];
              if (!card || !position) {
                return null;
              }
              return (
                <li className="reading-result-item" key={drawn.cardId}>
                  <span className="result-item-index">
                    {String(drawn.position + 1).padStart(2, '0')}
                  </span>
                  <Link
                    className="result-item-card"
                    to={`/cards/${card.id}`}
                    state={{
                      reversed: drawn.reversed,
                      positionLabel: position.label,
                      positionMeaning: position.meaning,
                    }}
                  >
                    <CardArtwork card={card} className={drawn.reversed ? 'is-reversed' : ''} />
                    <span>
                      <span className="eyebrow">{position.label.toUpperCase()}</span>
                      <strong>{card.name}</strong>
                      <span>
                        {drawn.reversed ? 'Reversed' : 'Upright'} · {position.meaning}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <section className="ai-reflection-panel" aria-labelledby={`ai-reflection-${reading.id}`}>
        <div>
          <p className="eyebrow">GEMINI FLASH</p>
          <h2 id={`ai-reflection-${reading.id}`}>{t.reading.aiReflectionTitle}</h2>
          <p className="page-description">{t.reading.aiReflectionPrivacy}</p>
        </div>
        {!interpretation?.hasGenerated && (
          <button
            className="secondary-button"
            type="button"
            disabled={isGenerating || !spread}
            onClick={generateInterpretation}
          >
            {isGenerating ? t.reading.generatingReflection : t.reading.generateReflection}
          </button>
        )}
        {isGenerating && (
          <p className="form-feedback" role="status">
            {t.reading.generatingReflection}
          </p>
        )}
        {interpretationMutation.error && (
          <p className="form-feedback status-error" role="alert">
            {interpretationMutation.error.message}
          </p>
        )}
        {interpretation?.text && <p className="ai-reflection-text">{interpretation.text}</p>}
        {interpretation?.hasGenerated && (
          <button
            className="text-button"
            type="button"
            disabled={
              isGenerating || interpretation.regenerationsUsed >= MAX_REFLECTION_REGENERATIONS
            }
            onClick={generateInterpretation}
          >
            {isGenerating
              ? `${t.reading.loadingReflection}${regenerationCountSuffix}`
              : interpretation.regenerationsUsed >= MAX_REFLECTION_REGENERATIONS
                ? `${t.reading.reflectionLimitReached}${regenerationCountSuffix}`
                : `${t.reading.regenerateReflection}${regenerationCountSuffix}`}
          </button>
        )}
      </section>

      <section className="notes-panel">
        <label className="field-label" htmlFor={`reading-notes-${reading.id}`}>
          {t.reading.notesLabel} <span>{t.reading.optional}</span>
        </label>
        <textarea
          id={`reading-notes-${reading.id}`}
          className="text-area"
          rows={4}
          maxLength={5000}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={t.reading.notesPlaceholder}
        />
        <div className="step-actions">
          <button
            className="primary-button"
            type="button"
            disabled={mutation.isPending}
            onClick={() => void saveNotes()}
          >
            {mutation.isPending
              ? t.journal.saving
              : isSaved
                ? t.reading.saveNotes
                : t.reading.saveReading}
          </button>
          {onRedo && (
            <button className="secondary-button" type="button" onClick={onRedo}>
              {t.reading.redo}
            </button>
          )}
          {isSaved && (
            <Link className="text-link" to="/journal">
              {t.reading.backToJournal}
            </Link>
          )}
        </div>
        <p
          className={
            feedback.startsWith('Could not') ? 'form-feedback status-error' : 'form-feedback'
          }
          aria-live="polite"
        >
          {feedback}
        </p>
        {!isSaved && <ErrorState error={saveReading.error ?? updateReading.error} />}
        <p className="disclaimer">{t.reading.disclaimer}</p>
      </section>
    </article>
  );
}
