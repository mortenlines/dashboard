# startpage

A personal start page for the internet. Open it and you see a greeting and an empty canvas; you build out the page by adding cards from a gallery. Each card knows how to configure itself, validate its inputs, and render its own content. Adding new card types means writing one folder under `src/cards/` and adding one line to the registry.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-first config — see `src/app/globals.css`)
- **Geist** sans + mono (Vercel's typeface, shipped via the `geist` npm package)
- **@dnd-kit** for accessible drag-and-drop reordering
- **Finnhub** for stock quotes + symbol verification (server-side; key never reaches the browser)
- Designed for **Vercel** hosting — zero-config deploy

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then add your Finnhub key
npm run dev
```

Open <http://localhost:3000>. The page loads empty — click **Add card** in the header to start.

### Finnhub API key

Stock cards call Finnhub for quotes and to verify ticker symbols before saving a card. Without a key, the stock card can't be added.

1. Sign up at <https://finnhub.io> (free tier: 60 requests/minute)
2. Copy your API key
3. Paste it into `.env.local`:

   ```
   FINNHUB_API_KEY=your_key_here
   ```
4. Restart `npm run dev` (env files are read at startup).

The key is read only in route handlers, so it never reaches the browser.

## Features

- **Empty by default.** First load shows just the greeting and an "Add your first card" CTA.
- **Card gallery.** *Add card* opens a dialog that lists every registered card type. Picking one shows a size selector and the card's own configuration form.
- **Inline editing.** Cards with options expose an Edit button on hover. The same dialog handles add and edit.
- **Drag to rearrange.** Each card has a small grip handle for mouse + touch dragging; keyboard users can pick up cards with Space/Enter and move with arrow keys. Arrow buttons in the card controls move a card one slot up/down — handy on small screens.
- **Remove.** A trash button on hover removes any card. Order, size, and config are persisted, so removals stick.
- **Personal greeting.** "Good evening, Morten." Name lives in a cookie, click *Edit name* to change.
- **Theme toggle.** Light/dark with a no-flash inline script; defaults to your system preference, persists your choice in a cookie.

### Card types

| Type | Options | Notes |
|---|---|---|
| **Clock** | Label + IANA timezone (or "Local") | Ticks every second |
| **Date** | None | Today's weekday + date |
| **Year progress** | Show months / days / hours (independent checkboxes, any combination including none) | Percent + bar always; selected metrics shown below |
| **Stock** | Ticker symbol + update interval (30s minimum) | Symbol verified against Finnhub before save. Shows last-fetched price + change %, plus a "Updated HH:MM:SS" timestamp; refreshes are subtle so the price never flickers to empty. |
| **Weather** | None (auto-location) | Asks the browser for your location, then fetches forecasts from yr.no. Small = current conditions; medium = current + next 2 days (high/low + condition). Refreshes every 10 minutes. |

### Update intervals and the free tier

Finnhub's free tier allows 60 requests per minute. The stock card's update interval is capped at 30 seconds — that ceiling lets you run **30 stock cards** in parallel and still stay inside the rate limit (30 cards × 2 requests/minute = 60). Pick longer intervals if you want more headroom or many more cards. The server also caches each ticker's response for 15 seconds, so two cards pointing at the same symbol on the same instance share a single upstream call.

## Persistence

| What | Where | Why |
|---|---|---|
| Name | Cookie | Server needs it to render the greeting on first paint without flash |
| Theme | Cookie | Server needs it to apply `data-theme` before paint |
| Card layout (types, sizes, configs, order) | `localStorage` (`startpage:layout:v1`) | Larger payload, only needed once interactive, doesn't bloat HTTP requests |

The hybrid approach is the standard pattern for dashboards: render the SSR-sensitive bits from cookies, hydrate the bigger client-only state from `localStorage` after mount.

## Project layout

```
src/
├── app/
│   ├── globals.css                Tailwind v4 + design tokens (light/dark) + <dialog> styling
│   ├── layout.tsx                 Root layout: fonts, theme cookie, no-flash script, <Providers>
│   ├── page.tsx                   Server component: greeting + add button + theme + grid
│   └── api/
│       ├── stock/route.ts         GET quote (proxy to Finnhub, 15s in-memory cache)
│       └── symbols/verify/route.ts GET symbol verification (used by stock config form)
├── cards/
│   ├── types.ts                   CardDefinition, CardInstance, CardSize, ConfigForm props…
│   ├── registry.ts                Central list of available card types
│   ├── clock/
│   │   ├── card.ts                Definition (default config, sizes, Component, ConfigForm, labelFor)
│   │   ├── ClockCard.tsx          Display
│   │   ├── ClockConfigForm.tsx    Config form (label + timezone)
│   │   └── timezones.ts           Curated IANA list
│   ├── date/
│   │   ├── card.ts                Definition (no config)
│   │   └── DateCard.tsx
│   ├── year-progress/
│   │   ├── card.ts                Definition (3 boolean toggles)
│   │   ├── YearProgressCard.tsx
│   │   └── YearProgressConfigForm.tsx
│   └── stock/
│       ├── card.ts                Definition (includes validateConfig calling /api/symbols/verify)
│       ├── StockCard.tsx          Client component: polls /api/stock, SWR display, timestamp
│       └── StockConfigForm.tsx
├── components/
│   ├── CardFrame.tsx              Sortable shell with hover controls (move / edit / remove)
│   ├── CardGrid.tsx               DndContext + SortableContext + empty state
│   ├── CardEditorDialog.tsx       Add/edit modal — type picker → size + ConfigForm → save
│   ├── CardEditorProvider.tsx     Owns dialog state; exposes openAdd() / openEdit() via context
│   ├── Providers.tsx              Wraps app in LayoutProvider + CardEditorProvider
│   ├── Dialog.tsx                 Thin wrapper around native <dialog>
│   ├── Button.tsx                 Variants: primary / secondary / ghost / danger
│   ├── Icons.tsx                  Small inline SVG icon set
│   ├── AddCardButton.tsx
│   ├── Greeting.tsx               Time-of-day greeting + name input
│   └── ThemeToggle.tsx
└── lib/
    ├── cookie-keys.ts             Constants/types (importable from client)
    ├── cookies.ts                 Server-only cookie reads
    ├── greeting.ts                "Good evening, X" composition
    ├── format.ts                  Date/time/currency formatters
    └── layout-context.tsx         LayoutProvider + useLayout (cards + persistence + reorder)
```

## Adding a new card type

1. Create a folder under `src/cards/<your-card>/`.
2. Build the display component — receives `{ config, size }`:

   ```tsx
   // src/cards/weather/WeatherCard.tsx
   "use client";
   import type { CardComponentProps } from "@/cards/types";

   export type WeatherConfig = { city: string };

   export function WeatherCard({ config }: CardComponentProps<WeatherConfig>) {
     return <div className="text-3xl">{config.city}: 18°</div>;
   }
   ```

3. (Optional) Build a config form — receives `{ value, onChange }`:

   ```tsx
   // src/cards/weather/WeatherConfigForm.tsx
   "use client";
   import type { CardConfigFormProps } from "@/cards/types";
   import type { WeatherConfig } from "./WeatherCard";

   export function WeatherConfigForm({
     value,
     onChange,
   }: CardConfigFormProps<WeatherConfig>) {
     return (
       <input
         value={value.city}
         onChange={(e) => onChange({ ...value, city: e.target.value })}
       />
     );
   }
   ```

4. (Optional) Add async validation — runs on save:

   ```ts
   async function validateConfig(config: WeatherConfig) {
     if (!config.city.trim()) return { ok: false, message: "Enter a city." };
     return { ok: true };
   }
   ```

5. Export the definition from `card.ts`:

   ```ts
   // src/cards/weather/card.ts
   import type { CardDefinition } from "@/cards/types";
   import { WeatherCard, type WeatherConfig } from "./WeatherCard";
   import { WeatherConfigForm } from "./WeatherConfigForm";

   export const weatherCard: CardDefinition<WeatherConfig> = {
     type: "weather",
     title: "Weather",
     description: "Current conditions for a city.",
     category: "info",
     sizes: ["sm", "md"],
     defaultSize: "sm",
     defaultConfig: { city: "" },
     Component: WeatherCard,
     ConfigForm: WeatherConfigForm,
     validateConfig,
     labelFor: (c) => c.city || "Weather",
   };

   export type { WeatherConfig };
   ```

6. Register it in `src/cards/registry.ts`:

   ```ts
   import { weatherCard } from "./weather/card";

   const definitions = [
     /* … */
     weatherCard,
   ];
   ```

That's it. The grid, dialog, drag-and-drop, persistence, and edit/remove controls all work without touching any other file.

### Server cards vs. client cards

- **Server cards** (`async function`) — useful when a card needs a secret or wants to leverage Next's data cache. Server cards are wrapped in `<Suspense>` by the grid; they stream their HTML to the browser.
- **Client cards** (`"use client"`) — used for live-updating data (clocks, polled stock prices). Hydrate and tick locally. The stock card is the canonical example: it polls `/api/stock` on a configurable interval, keeps the previous value during refetches, and shows a timestamp.

## Design tokens

All colors flow through CSS variables (`--bg`, `--surface`, `--text`, …) defined in `globals.css`. Each token has a light and a dark value; Tailwind utilities (`bg-surface`, `text-muted`, `border-border`, …) are wired to the same variables. Toggle theme = swap one attribute on `<html>`.

## Deployment

Push to GitHub and import on Vercel. Add `FINNHUB_API_KEY` as an environment variable in the Vercel project settings. No other configuration needed.

## Scripts

```bash
npm run dev          # local dev with Turbopack
npm run build        # production build
npm run start        # serve a built app
npm run lint         # next lint
npm run typecheck    # tsc --noEmit
```
