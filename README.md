# Arcana

A local-first tarot reflection app. Readings and preferences stay on this device;
the app can later switch its repository implementations to an API without
changing the screens.

## Run locally

Requirements: Node.js 20.19+ or 22.12+, pnpm 10+.

```sh
pnpm install
pnpm dev
```

Vite serves the app at <http://localhost:5173>.

To enable AI-generated card reflections, start the API in a second terminal:

```sh
pnpm --filter @tarot/api dev
```

The API reads `GEMINI_API_KEY` from `apps/api/.env`; the key stays server-side and is never bundled into the web app. The web app proxies `/api` requests to the local API. A reading's question and drawn card details are sent to Gemini Flash only when **Generate AI reflection** is selected.

After deployment, verify API availability with `GET /api/health`; it returns
`{"status":"ok"}` when the managed Functions API is running.

## Deploy to Azure Static Web Apps

The Azure Static Web Apps workflow deploys the frontend and its managed Azure
Functions API together. The app source is in `apps/web`; the Functions v4 API
source is in `apps/api`. The workflow builds the frontend and packages the API,
including its `@tarot/shared` workspace dependency, before uploading both to the
Static Web App. The API is available at `/api/interpretation`; no separately
hosted Function App or API-linking step is required.

Configure `GEMINI_API_KEY` in the Static Web App's application settings (and
optionally `GEMINI_MODEL`). Never put the key in the frontend or commit it.
For local development, the lightweight API server reads `GEMINI_API_KEY` from
`apps/api/.env`; start it with `pnpm --filter @tarot/api dev`.

For local development with Azure Functions Core Tools, run
`pnpm --filter @tarot/api start:functions` after installing dependencies and
building `@tarot/shared`.

## Build, test, and lint

```sh
pnpm build
pnpm test
pnpm lint
```

The production build generates an offline precache containing the app shell,
card data, and card images.

## Install on a phone

Arcana is an installable Progressive Web App. Deploy it over HTTPS, then:

- **iPhone/iPad:** Open the site in Safari, tap **Share**, then **Add to Home Screen**.
- **Android:** Open the site in Chrome, tap **Install app** (or **Add to Home screen**) in the browser menu.

After the first load, the app shell, card data, and card images are available offline.
Saved readings and preferences are stored locally on the device.

## Screens and flows

- Home links into a one-, three-, or ten-card reading and lists recent saved readings.
- Readings allow an optional question, shuffled user-triggered draws, a result view,
  card detail navigation, notes, saving, and redo.
- The card library supports search by name/keyword and filters for Major Arcana or suit.
- The journal lists readings newest-first, allows editing notes, opening a reading, and deleting it.
- Settings persist the theme, reversed-card preference, and reduced-motion preference.

Card meanings are from the public-domain Waite text and are included in `CREDITS.md`.
Readings are for reflection and entertainment, not professional advice.
