import { useEffect, useState, type PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';
import { useSettings } from '../../data/hooks';
import { getText } from '../../lib/i18n';
import { useUiStore } from '../../store/uiStore';
import { navigationItems } from './navigation';
import { ThemeToggle } from './ThemeToggle';

function NavigationLinks() {
  const { data: settings } = useSettings();
  const t = getText(settings?.language);

  return navigationItems.map(({ key, symbol, to }) => (
    <NavLink
      key={to}
      to={to}
      end={to === '/'}
      className={({ isActive }) => `navigation-link${isActive ? ' is-active' : ''}`}
    >
      <span className="navigation-symbol" aria-hidden="true">
        {symbol}
      </span>
      <span>{t.nav[key]}</span>
    </NavLink>
  ));
}

export function AppShell({ children }: PropsWithChildren) {
  const { data: settings } = useSettings();
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (settings) {
      setTheme(settings.theme);
    }
  }, [settings, setTheme]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const update = () => setSystemTheme(media.matches ? 'light' : 'dark');
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const resolvedTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    document.documentElement.lang = settings?.language ?? 'en';
  }, [settings?.language]);

  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', resolvedTheme === 'dark' ? '#080a18' : '#f8f6f1');
  }, [resolvedTheme]);

  return (
    <div
      className={`app-shell${resolvedTheme === 'dark' ? ' dark' : ''}`}
      data-theme={resolvedTheme}
    >
      <aside className="side-navigation" aria-label="Main navigation">
        <NavLink className="brand" to="/" aria-label="Arcana home">
          <span className="brand-mark" aria-hidden="true">
            ✧
          </span>
          <span>ARCANA</span>
        </NavLink>
        <nav className="navigation-links">
          <NavigationLinks />
        </nav>
        <ThemeToggle />
      </aside>

      <div className="main-column">
        <header className="mobile-header">
          <NavLink className="brand" to="/">
            <span className="brand-mark" aria-hidden="true">
              ✧
            </span>
            <span>ARCANA</span>
          </NavLink>
          <ThemeToggle />
        </header>
        <main className="page-content">{children}</main>
        <nav className="bottom-navigation" aria-label="Main navigation">
          <NavigationLinks />
        </nav>
      </div>
    </div>
  );
}
