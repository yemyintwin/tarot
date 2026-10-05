# SPEC.md — Tarot Reading Card App

> Instructions for the AI coding agent. Read this file fully before writing code.
> If something here conflicts with a mockup, ask before deciding. Do not invent features not listed here.

## 1. Product summary

A tarot reading app where the user picks a spread, shuffles and draws cards, reads the meanings, and saves the reading to a personal journal.

- Works on **mobile, tablet and desktop** (responsive, mobile-first).
- Installable as a **PWA** and usable **offline**.
- **Phase 1 has no backend.** All data is local. The code must make adding a backend later easy.

## 2. Design source of truth

- Mockup screens are in `/design/` (PNG/Figma export). Match layout, spacing, colors and typography from them.
- Extract design tokens (colors, fonts, radii, spacing) into `tailwind.config.ts` and a `tokens` section of the theme. Do not hard-code colors in components.
- Breakpoints: mobile < 640px, tablet 640–1024px, desktop > 1024px.
  - Mobile: bottom navigation.
  - Tablet and desktop: side navigation, and the spread layout uses the extra space.

## 3. Tech stack

**Front end (`apps/web`)**
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Framer Motion (card flip, shuffle, draw animations)
- React Router
- TanStack Query (all data access goes through it)
- Zustand (local UI state only)
- React Hook Form + Zod (forms)
- Dexie (IndexedDB) for phase 1 storage
- vite-plugin-pwa

**Backend (`apps/api`) — Phase 2, do not build yet**
- Node.js + TypeScript, Fastify or Hono
- SQLite then PostgreSQL, Drizzle ORM
- Zod schemas shared from `packages/shared`

**Tooling:** pnpm workspaces, ESLint, Prettier, Vitest, Playwright (a few smoke tests).

## 4. Repository structure

```
/apps/web          React PWA
/apps/api          API (phase 2, empty for now)
/packages/shared   Zod schemas and TypeScript types
/design            mockups
SPEC.md
CLAUDE.md          (short pointer to this file)
```

## 5. Architecture rules (important)

1. **Repository pattern.** UI components never touch Dexie or `fetch` directly. They call hooks (TanStack Query) that call repository interfaces in `apps/web/src/data/`.
2. Define interfaces first, for example `ReadingRepository`, `CardRepository`, `SettingsRepository`. Phase 1 implementations use Dexie and static JSON. Phase 2 will add HTTP implementations with the same interfaces.
3. All data types come from **Zod schemas in `packages/shared`**. Infer TypeScript types from them. Do not duplicate types.
4. Feature-based folders: `features/spreads`, `features/reading`, `features/journal`, `features/cards`, `features/settings`.
5. Keep components small. Business logic (shuffle, draw, spread layout) lives in pure functions with unit tests, not in components.
6. No secrets in the front end. Any future AI or API keys live on the backend only.

## 6. Data model

### Card (static, bundled as JSON — 78 cards)
```ts
Card {
  id: string            // e.g. "major-00-fool", "cups-02"
  name: string
  arcana: "major" | "minor"
  suit?: "wands" | "cups" | "swords" | "pentacles"
  number: number
  keywords: { upright: string[]; reversed: string[] }
  meaning: { upright: string; reversed: string }
  image: string         // path to bundled asset
}
```

### Spread (config-driven, data not code)
```ts
Spread {
  id: string            // "one-card", "three-card", "celtic-cross"
  name: string
  description: string
  positions: { index: number; label: string; meaning: string; x: number; y: number }[]
}
```
Initial spreads: **One Card**, **Three Card (Past / Present / Future)**, **Celtic Cross (10 cards)**. Adding a spread must require only adding a config entry.

### Reading (saved by the user)
```ts
Reading {
  id: string            // uuid
  createdAt: string     // ISO date
  spreadId: string
  question?: string
  cards: { position: number; cardId: string; reversed: boolean }[]
  notes?: string
  updatedAt: string
}
```

### Settings
```ts
Settings {
  theme: "light" | "dark" | "system";
  language: "en" | "my" | string;
  allowReversed: boolean;
  reducedMotion: boolean;
}
```

## 7. Screens and flows

> Align exact layouts with `/design`. Names below are working names.

1. **Home**: start a reading, quick draw (one card), recent readings.
2. **Spread picker**: list of spreads with a short description.
3. **Question (optional)**: free-text intention or question, skippable.
4. **Shuffle and draw**: animated deck, user draws the required number of cards.
5. **Reading result**: cards laid out per spread positions, tap a card to open its detail (position meaning plus upright or reversed meaning). Actions: save, add notes, redo.
6. **Card library**: browse all 78 cards, filter by arcana or suit, search by name or keyword.
7. **Card detail**: image, keywords, upright and reversed meanings.
8. **Journal**: list of saved readings (newest first), open, edit notes, delete.
9. **Settings**: theme, language option, allow reversed cards, reduced motion, and a placeholder for "About / disclaimer".

## 8. Core logic requirements

- **Shuffle:** Fisher-Yates using `crypto.getRandomValues` (not `Math.random`).
- **Reversed cards:** each drawn card is reversed with 50% probability if `allowReversed` is on.
- **No duplicates** within one reading.
- Draw is user-triggered (tap or click per card, or "draw all"), animated.
- Respect `prefers-reduced-motion`: replace animations with simple fades.

## 9. Non-functional requirements

- **Responsive and touch-friendly:** tap targets at least 44px, no hover-only interactions.
- **Performance:** first load under 3s on mid-range mobile. Lazy-load card images, use responsive image sizes (WebP/AVIF), and code-split routes.
- **Offline:** the app shell, card data and card images are precached. Journal works offline.
- **Accessibility:** keyboard navigable, visible focus states, alt text on card images, sufficient contrast, ARIA labels on icon buttons.
- **Disclaimer:** include a short note that readings are for reflection and entertainment, not professional advice.

## 10. Phases and tasks

**Phase 1 — local-only MVP** (build in this order, run and verify after each step)
1. Scaffold the monorepo, Tailwind theme tokens, routing and app shell with responsive navigation.
2. `packages/shared` schemas. Card JSON data (78 cards). Spread configs.
3. Repository interfaces and Dexie/static implementations.
4. Shuffle/draw logic with unit tests.
5. Spread picker, shuffle and draw, reading result screens with animations.
6. Card library and detail.
7. Journal (save, list, edit notes, delete).
8. Settings with language option, PWA setup, offline caching.
9. Responsive and accessibility polish, smoke tests.

**Phase 2 — backend (later, not now)**
- Build `apps/api` with accounts, reading sync, and the same Zod contracts. Add OpenAPI docs.
- Add HTTP repository implementations and switch via config. UI must not change.

**Phase 3 — language option / multi-language**
- Add a language selector in Settings and support at least English and Burmese across all screens, including reading content.
- Design the app for extensibility so more locales can be added later without changing screen logic.

**Phase 4 — optional**
- AI-generated reading interpretation (server-side LLM call, API key on the server only).
- More spreads, multiple decks, sharing a reading.

## 11. Out of scope (for now)

Accounts, payments, push notifications, social features, AI interpretation.

## 12. Working agreement for the agent

- Work in small steps. After each step, make sure the app builds (`pnpm build`) and runs.
- Ask before adding dependencies not listed in section 3.
- Prefer simple, readable code over clever abstractions.
- When a bug appears, explain the cause before changing code.
- Commit-sized changes: one feature per change, with a short summary of what changed and how to test it.
- Card artwork: use only public-domain or properly licensed images. Leave placeholders if unsure and flag it.

## 13. Open questions (fill these in)

- App name and branding:
- Final deck/art source:
- Languages needed later:
- Hosting preference:
