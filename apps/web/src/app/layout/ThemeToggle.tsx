import { useSaveSettings, useSettings } from '../../data/hooks';

export function ThemeToggle() {
  const { data: settings } = useSettings();
  const saveSettings = useSaveSettings();
  const theme = settings?.theme ?? 'dark';
  const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';

  return (
    <>
      <button
        className="theme-toggle"
        type="button"
        onClick={() =>
          saveSettings.mutate({
            ...(settings ?? { theme: 'dark', language: 'en', allowReversed: true, reducedMotion: false }),
            theme: nextTheme,
          })
        }
        aria-label={`Switch to ${nextTheme} theme`}
        disabled={!settings || saveSettings.isPending}
      >
        {theme === 'dark' ? 'Dark theme' : theme === 'light' ? 'Light theme' : 'System theme'}
      </button>
      {saveSettings.error && (
        <span className="theme-error" role="alert">
          Theme preference could not be saved: {saveSettings.error.message}
        </span>
      )}
    </>
  );
}
