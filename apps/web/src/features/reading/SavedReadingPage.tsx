import { useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/QueryState';
import { useReading, useSettings } from '../../data/hooks';
import { getText } from '../../lib/i18n';
import { ReadingResult } from './components/ReadingResult';

export function SavedReadingPage() {
  const { readingId } = useParams();
  const { data: reading, isPending, error } = useReading(readingId);
  const { data: settings } = useSettings();
  const t = getText(settings?.language);

  if (isPending) {
    return <LoadingState label={t.reading.openingSaved} />;
  }
  if (error) {
    return <ErrorState error={error} />;
  }
  if (!reading) {
    return (
      <section className="content-page">
        <p className="eyebrow">{t.reading.notFound}</p>
        <h1>{t.reading.readingUnavailable}</h1>
        <p className="page-description">{t.reading.readingUnavailableBody}</p>
      </section>
    );
  }

  return <ReadingResult reading={reading} isSaved />;
}
