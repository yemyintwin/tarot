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

## Deploy the API

The frontend is deployed to Azure Static Web Apps, and the API is deployed separately as an Azure Functions app. The Static Web App must use the Standard plan to link an existing Function App. In the Static Web App's **APIs** settings, link the Function App; requests to `/api/interpretation` are then proxied to its `/api/interpretation` route.

The API is an Azure Functions Node.js v4 HTTP trigger in `apps/api/src/index.mjs`. Create the Function App with the Node.js 22 runtime and Functions runtime 4. Configure `GEMINI_API_KEY` in the Function App's application settings (and optionally `GEMINI_MODEL`). Never put the key in the frontend or commit it.

Add these GitHub Actions repository secrets to deploy the API:

- `AZURE_FUNCTIONAPP_NAME`: the Function App's resource name.
- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`: its publish profile XML.

Push changes to `apps/api` or `packages/shared` on `main`, or manually run the **Azure Functions API** workflow. It packages the shared workspace dependency and deploys the API independently. The Static Web App workflow continues to deploy only the frontend.

The HTTP trigger allows anonymous requests so the frontend can call it. If you link the Function App to the Static Web App, configure its authentication/access settings to prevent unwanted direct calls to the Function App URL, which could consume your Gemini quota.

For local development with Azure Functions Core Tools, run `pnpm --filter @tarot/api start:functions` after installing dependencies and building `@tarot/shared`. The existing `pnpm --filter @tarot/api dev` command remains available for the lightweight local HTTP server.

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
