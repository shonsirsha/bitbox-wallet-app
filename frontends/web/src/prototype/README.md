# UI refresh prototypes (throwaway)

Five radically different directions for the whole BitBoxApp UI, rendered on the existing hash
routes and switchable at runtime. Built with the `prototype` skill (UI branch, sub-shape A).
This code lives on the `prototype/ui-refresh` branch only and must never be merged as is.

## Run

```
cd frontends/web
npm run prototype        # http://localhost:8090
```

No Go backend is needed: `mock/install.ts` intercepts the app's `fetch` calls to
`localhost:8082/api/*` and its `/api/events` WebSocket, and answers from an in-memory demo
wallet (`mock/demo-data.ts`). Nothing ever reaches a real backend, so it can run next to
`make servewallet` + `make webdev` without the one-frontend-at-a-time limitation.

## URL parameters

| Param | Values | Effect |
|---|---|---|
| `variant` | `0`, `A`–`E` | `0` is today's app on the demo wallet; `A`–`E` are the directions |
| `lang` | e.g. `de`, `ar` | switch language (long strings / right-to-left) |

The floating black pill switches variants (also ← / →), cycles the theme (Auto / Light / Dark)
and opens the component kit (`#/prototype/kit`). Example:
`http://localhost:8090/?variant=B#/account/v0-f2a91c07-btc-0`.

## Directions

| Key | Name | Structure |
|---|---|---|
| A | Quiet Swiss | No cards, hairline lists, large light numerals; sidebar from tablet up, tab bar on phones |
| B | Vault | Dark-first, device-centric; BitBox status leads; dark sidebar / rail |
| C | Activity first | One centered column, no navigation chrome; feed is home; account switcher sheet |
| D | Workspace | Master–detail panes (accounts / content / inspector) on desktop, stacked on phones |
| E | Calm cards (round 1 pick) | Soft cards and action row; B's dark sidebar with a compact device row (rail on tablet), a D-style top bar with total and Settings, C's accounts list; floating tab bar on phones |

Round 1 covers the app frame, Portfolio, Accounts, Account and Transaction details. Other routes
show a placeholder inside each direction's shell.

## Rules the directions follow

- Screens are composed only from the kit in `kit/` (see `kit/index.ts` and the live kit page).
  Direction folders contain layout only (grid, sizing, breakpoints, token overrides).
- All colours come from the BitBox palette (`src/style/variables.css`) through the `--k-*`
  tokens in `kit/tokens.css`. Filled buttons use `#4F7998` (white text 4.6:1, WCAG AA; today's `#5E94BF` is 3.25:1).
  Tertiary text uses one extra neutral grey, `#6B6B6B`, so small labels pass AA.
- Touch screens get 44px minimum controls; no blur or heavy effects (Qt's Chromium may render in software).
- Lightning has no tablet/desktop navigation entry; phones keep it in the tab bar.
- Breakpoints match the app: phone ≤768px, tablet 769–1199px, desktop ≥1200px.
- Data comes from the app's real API modules (`src/api/*`) and hooks (`useLoad`) via `data.ts`.

## Layout

```
prototype/
  main.tsx            entry (installs the mock first)
  prototype-root.tsx  variant switching (?variant=), theme, ?lang
  prototype-app.tsx   wraps a direction in tokens + context
  prototype-bar.tsx   floating switcher (not part of any design)
  routing.ts          parses the existing hash routes
  data.ts             data hooks over src/api/*
  kit/                the component kit + tokens
  patterns/           shared compositions (transaction row/details, kit page, placeholder)
  directions/         one folder per direction (layout only)
  mock/               mock backend + demo wallet
```

## Research

The design research behind the directions is in `RESEARCH.md` (sources included).
