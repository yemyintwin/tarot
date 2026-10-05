import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoadingState } from './components/QueryState';

const CardsPage = lazy(() =>
  import('./features/cards/CardsPage').then((module) => ({ default: module.CardsPage })),
);
const CardDetailPage = lazy(() =>
  import('./features/cards/CardDetailPage').then((module) => ({
    default: module.CardDetailPage,
  })),
);
const HomePage = lazy(() =>
  import('./features/home/HomePage').then((module) => ({ default: module.HomePage })),
);
const JournalPage = lazy(() =>
  import('./features/journal/JournalPage').then((module) => ({ default: module.JournalPage })),
);
const ReadingPage = lazy(() =>
  import('./features/reading/ReadingPage').then((module) => ({ default: module.ReadingPage })),
);
const SavedReadingPage = lazy(() =>
  import('./features/reading/SavedReadingPage').then((module) => ({
    default: module.SavedReadingPage,
  })),
);
const SettingsPage = lazy(() =>
  import('./features/settings/SettingsPage').then((module) => ({ default: module.SettingsPage })),
);
const SpreadsPage = lazy(() =>
  import('./features/spreads/SpreadsPage').then((module) => ({ default: module.SpreadsPage })),
);

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingState />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/spreads" element={<SpreadsPage />} />
        <Route path="/reading" element={<Navigate to="/spreads" replace />} />
        <Route path="/reading/saved/:readingId" element={<SavedReadingPage />} />
        <Route path="/reading/:spreadId" element={<ReadingPage />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/cards/:cardId" element={<CardDetailPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
