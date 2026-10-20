# Redesigned UI preview (throwaway)

A UI-refresh prototype of the BitBoxApp ("Calm cards"), rendered on the existing hash routes on
a mocked backend. Built with the
`prototype` skill. This code lives on prototype branches only and must never be merged as is:
`prototype/ui-refresh` keeps all five explored directions, `prototype/calm-cards-preview` (this
one) only the chosen direction.

## Run

```
cd frontends/web
npm run prototype        # http://localhost:8090
```

No Go backend is needed: `mock/install.ts` intercepts the app's `fetch` calls to
`localhost:8082/api/*` and its `/api/events` WebSocket and answers from an in-memory demo
wallet (`mock/demo-data.ts`). Nothing reaches a real backend.

## Static preview build

```
cd frontends/web
npx vite build --mode prototype     # writes build/ (relative asset paths, hash routing)
```

`build/` is a plain static site: any static host serves it without rewrites.

## URL parameters

| Param | Values | Effect |
|---|---|---|
| `lang` | e.g. `de`, `ar` | switch language (long strings / right-to-left) |

The theme is dark; a saved `prototype-theme-v2` entry in localStorage (`light`, `dark` or `auto`)
overrides it. The component kit lives at `#/prototype/kit`.

## What the preview covers

Portfolio, Accounts (sidebar list with search, sort and coin filter; Accounts tab on phones),
the account screen and transaction details, on phones, tablets and desktop, light and dark.
Other routes show a "next design round" placeholder inside the app frame.

## Rules the screens follow

- Screens are composed only from the kit in `kit/` (see `kit/index.ts` and the kit page); the
  kit contains exactly what the screens use.
- All colours come from the BitBox palette (`src/style/variables.css`) through the `--k-*`
  tokens in `kit/tokens.css`. Filled buttons use `#4F7998` (white text 4.6:1, WCAG AA; today's
  `#5E94BF` is 3.25:1). Tertiary text uses one extra neutral grey, `#6B6B6B`, so small labels
  pass AA.
- Touch screens get 44px minimum controls; no blur or heavy effects (Qt's Chromium may render
  in software).
- Lightning has no tablet/desktop navigation entry; phones keep it in the tab bar.
- Breakpoints match the app: phone ≤768px, tablet 769–1199px, desktop ≥1200px.
- Data comes from the app's real API modules (`src/api/*`) and hooks (`useLoad`) via `data.ts`.

## Layout

```
prototype/
  main.tsx            entry (installs the mock first)
  prototype-app.tsx   wraps the screens in tokens, theme + context
  routing.ts          parses the existing hash routes
  data.ts             data hooks over src/api/*
  kit/                the component kit + tokens
  patterns/           shared compositions (transaction row/details, kit page, placeholder)
  directions/         the Calm cards screens (layout only)
  mock/               mock backend + demo wallet
```

The design research behind the refresh is in `RESEARCH.md`.
