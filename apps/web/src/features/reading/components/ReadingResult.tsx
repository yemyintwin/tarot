import { ReadingSchema, type Reading } from '@tarot/shared';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CardArtwork } from '../../../components/CardArtwork';
import { ErrorState } from '../../../components/QueryState';
import { useCards, useSaveReading, useSettings, useUpdateReading } from '../../../data/hooks';
import { spreads } from '../../../content/spreads';
import { getLocalizedCard, getText } from '../../../lib/i18n';

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
  const [notes, setNotes] = useState(reading.notes ?? '');
  const [feedback, setFeedback] = useState('');
  const spread = spreads.find((item) => item.id === reading.spreadId);
  const cardById = useMemo(
    () => new Map(cards.map((card) => [card.id, getLocalizedCard(card, settings?.language)])),
    [cards, settings?.language],
  );
  const mutation = isSaved ? updateReading : saveReading;

  useEffect(() => {
    setNotes(reading.notes ?? '');
    setFeedback('');
  }, [reading.id, reading.notes]);

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
            {mutation.isPending ? t.journal.saving : isSaved ? t.reading.saveNotes : t.reading.saveReading}
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
