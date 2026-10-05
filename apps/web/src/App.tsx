import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './app/providers/AppProviders';
import { AppShell } from './app/layout/AppShell';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </BrowserRouter>
    </AppProviders>
  );
}
