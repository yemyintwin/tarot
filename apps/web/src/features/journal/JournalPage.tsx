import { ReadingSchema, type Reading } from '@tarot/shared';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CardArtwork } from '../../components/CardArtwork';
import { ErrorState, LoadingState, PageTitle } from '../../components/QueryState';
import { useCards, useDeleteReading, useReadings, useSettings, useUpdateReading } from '../../data/hooks';
import { spreads } from '../../content/spreads';
import { getText } from '../../lib/i18n';

function JournalEntry({ reading, onDelete }: { reading: Reading; onDelete: () => void }) {
  const { data: settings } = useSettings();
  const t = getText(settings?.language);
  const [notes, setNotes] = useState(reading.notes ?? '');
  const [feedback, setFeedback] = useState('');
  const updateReading = useUpdateReading();
  const { data: cards = [] } = useCards();
  const card = cards.find((item) => item.id === reading.cards[0]?.cardId);
  const spread = spreads.find((item) => item.id === reading.spreadId);

  async function saveNotes(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await updateReading.mutateAsync(
        ReadingSchema.parse({
          ...reading,
          notes: notes.trim() || undefined,
          updatedAt: new Date().toISOString(),
        }),
      );
      setFeedback(t.journal.notesUpdated);
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? `Could not update notes: ${error.message}`
          : 'Could not update notes.',
      );
    }
  }

  return (
    <article className="journal-entry">
      {card && <CardArtwork card={card} />}
      <div className="journal-entry-main">
        <p className="eyebrow">
          {new Date(reading.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
        </p>
        <h2>{spread?.name ?? t.common.reading}</h2>
        {reading.question && <p className="journal-question">“{reading.question}”</p>}
        <p className="journal-entry-meta">
          {reading.cards.length} {reading.cards.length === 1 ? t.common.card : t.common.cardsPlural} · {t.journal.updated}{' '}
          {new Date(reading.updatedAt).toLocaleDateString()}
        </p>
        {reading.notes && <p className="journal-notes-preview">{reading.notes}</p>}
        <div className="journal-entry-actions">
          <Link className="text-link" to={`/reading/saved/${reading.id}`}>
            {t.journal.openReading} <span aria-hidden="true">↗</span>
          </Link>
          <button className="danger-link" type="button" onClick={onDelete}>
            {t.journal.delete}
          </button>
        </div>
        <details className="journal-edit">
          <summary>{reading.notes ? t.journal.editNotes : t.journal.addNotes}</summary>
          <form onSubmit={(event) => void saveNotes(event)}>
            <label className="field-label" htmlFor={`journal-note-${reading.id}`}>
              {t.journal.privateNotes}
            </label>
            <textarea
              id={`journal-note-${reading.id}`}
              className="text-area"
              rows={3}
              maxLength={5000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            <button className="secondary-button" type="submit" disabled={updateReading.isPending}>
              {updateReading.isPending ? t.journal.saving : t.journal.saveNotes}
            </button>
            <p className="form-feedback" aria-live="polite">
              {feedback}
            </p>
            <ErrorState error={updateReading.error} />
          </form>
        </details>
      </div>
    </article>
  );
}

export function JournalPage() {
  const { data: readings, isPending, error } = useReadings();
  const { data: settings } = useSettings();
  const t = getText(settings?.language);
  const deleteReading = useDeleteReading();
  const [feedback, setFeedback] = useState('');

  async function removeReading(id: string) {
    if (!window.confirm(t.journal.deletePrompt)) {
      return;
    }
    try {
      await deleteReading.mutateAsync(id);
      setFeedback(t.journal.readingDeleted);
    } catch (caught) {
      setFeedback(
        caught instanceof Error
          ? `Could not delete the reading: ${caught.message}`
          : 'Could not delete the reading.',
      );
    }
  }

  return (
    <section className="content-page">
      <PageTitle
        eyebrow={t.journal.eyebrow}
        title={t.journal.title}
        description={t.journal.description}
      />
      <p className="form-feedback" aria-live="polite">
        {feedback}
      </p>
      <ErrorState error={deleteReading.error} />
      {isPending ? (
        <LoadingState label={t.journal.opening} />
      ) : error ? (
        <ErrorState error={error} />
      ) : readings.length === 0 ? (
        <div className="empty-state">
          <span className="placeholder-symbol" aria-hidden="true">
            ✧
          </span>
          <h2>{t.journal.emptyTitle}</h2>
          <p>{t.journal.emptyBody}</p>
          <Link className="primary-button" to="/spreads">
            {t.journal.beginReading}
          </Link>
        </div>
      ) : (
        <div className="journal-list">
          {readings.map((reading) => (
            <JournalEntry
              key={reading.id}
              reading={reading}
              onDelete={() => void removeReading(reading.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
