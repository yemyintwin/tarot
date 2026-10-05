import type { Spread } from '@tarot/shared';
import { PageTitle } from '../../../components/QueryState';
import { useSettings } from '../../../data/hooks';
import { getText } from '../../../lib/i18n';

export function QuestionStep({
  spread,
  question,
  onQuestionChange,
  onContinue,
}: {
  spread: Spread;
  question: string;
  onQuestionChange: (question: string) => void;
  onContinue: () => void;
}) {
  const { data: settings } = useSettings();
  const t = getText(settings?.language);

  return (
    <div className="question-step">
      <PageTitle
        eyebrow={`${spread.positions.length} CARD${spread.positions.length === 1 ? '' : 'S'} · ${t.reading.yourReading}`}
        title={t.reading.questionTitle}
        description={`${spread.name}: ${spread.description} ${t.reading.questionDescription}`}
      />
      <label className="field-label" htmlFor="reading-question">
        {t.reading.questionLabel} <span>{t.reading.optional}</span>
      </label>
      <textarea
        id="reading-question"
        className="text-area"
        rows={4}
        maxLength={500}
        value={question}
        onChange={(event) => onQuestionChange(event.target.value)}
        placeholder={t.reading.questionPlaceholder}
      />
      <div className="field-hint-row">
        <span>{t.reading.questionHint}</span>
        <span>{question.length}/500</span>
      </div>
      <div className="step-actions">
        <button className="primary-button" type="button" onClick={onContinue}>
          {question.trim() ? t.reading.continue : t.reading.skipQuestion} <span aria-hidden="true">→</span>
        </button>
      </div>
      <p className="disclaimer">{t.reading.disclaimer}</p>
    </div>
  );
}
