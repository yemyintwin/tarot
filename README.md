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
