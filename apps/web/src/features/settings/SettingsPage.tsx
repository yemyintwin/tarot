import type { Settings } from '@tarot/shared';
import { useEffect, useState } from 'react';
import { ErrorState, LoadingState, PageTitle } from '../../components/QueryState';
import { useSaveSettings, useSettings } from '../../data/hooks';
import { getText } from '../../lib/i18n';

export function SettingsPage() {
  const { data: settings, isPending, error } = useSettings();
  const saveSettings = useSaveSettings();
  const [feedback, setFeedback] = useState('');
  const t = getText(settings?.language);

  async function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    if (!settings) {
      return;
    }
    setFeedback('');
    try {
      await saveSettings.mutateAsync({ ...settings, [key]: value });
      setFeedback(t.settings.saved);
    } catch (caught) {
      setFeedback(
        caught instanceof Error
          ? `Could not save preferences: ${caught.message}`
          : 'Could not save preferences.',
      );
    }
  }

  useEffect(() => {
    if (settings) {
      setFeedback('');
    }
  }, [settings]);

  return (
    <section className="content-page settings-page">
      <PageTitle
        eyebrow={t.settings.eyebrow}
        title={t.settings.title}
        description={t.settings.description}
      />
      {isPending ? (
        <LoadingState label="Loading your preferences…" />
      ) : error ? (
        <ErrorState error={error} />
      ) : settings ? (
        <>
          <div className="settings-list">
            <label className="setting-row" htmlFor="theme-setting">
              <span>
                <strong>{t.settings.appearance}</strong>
                <small>{t.settings.appearanceHint}</small>
              </span>
              <select
                id="theme-setting"
                className="select-field"
                value={settings.theme}
                disabled={saveSettings.isPending}
                onChange={(event) =>
                  void updateSetting('theme', event.target.value as Settings['theme'])
                }
              >
                <option value="system">{t.settings.system}</option>
                <option value="dark">{t.settings.dark}</option>
                <option value="light">{t.settings.light}</option>
              </select>
            </label>
            <label className="setting-row" htmlFor="language-setting">
              <span>
                <strong>{t.settings.language}</strong>
                <small>{t.settings.languageHint}</small>
              </span>
              <select
                id="language-setting"
                className="select-field"
                value={settings.language}
                disabled={saveSettings.isPending}
                onChange={(event) =>
                  void updateSetting('language', event.target.value as Settings['language'])
                }
              >
                <option value="en">{t.settings.english}</option>
                <option value="my">{t.settings.burmese}</option>
              </select>
            </label>
            <label className="setting-row" htmlFor="reversed-setting">
              <span>
                <strong>{t.settings.reversed}</strong>
                <small>{t.settings.reversedHint}</small>
              </span>
              <input
                id="reversed-setting"
                className="toggle-input"
                type="checkbox"
                checked={settings.allowReversed}
                disabled={saveSettings.isPending}
                onChange={(event) => void updateSetting('allowReversed', event.target.checked)}
              />
            </label>
            <label className="setting-row" htmlFor="motion-setting">
              <span>
                <strong>{t.settings.motion}</strong>
                <small>{t.settings.motionHint}</small>
              </span>
              <input
                id="motion-setting"
                className="toggle-input"
                type="checkbox"
                checked={settings.reducedMotion}
                disabled={saveSettings.isPending}
                onChange={(event) => void updateSetting('reducedMotion', event.target.checked)}
              />
            </label>
          </div>
          <p className="form-feedback" aria-live="polite">
            {feedback}
          </p>
          <ErrorState error={saveSettings.error} />
          <section className="disclaimer-panel">
            <p className="eyebrow">{t.settings.about}</p>
            <h2>{t.settings.aboutTitle}</h2>
            <p>{t.settings.aboutBody}</p>
          </section>
        </>
      ) : null}
    </section>
  );
}
