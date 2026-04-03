# Spotify Stats — Web

Vite + React SPA that lets visitors browse listening stats for any connected Spotify account — no login required.

## Architecture

```
src/
├── main.tsx             # React entry point (StrictMode, QueryClient, Router)
├── App.tsx              # Route definitions (single route: /)
├── index.css            # Tailwind base styles
├── pages/
│   └── Home.tsx         # Single page: user picker + time range + stats tabs
├── components/
│   ├── AlbumGrid.tsx    # Top albums display
│   ├── ArtistList.tsx   # Top artists display
│   ├── RecentList.tsx   # Recently played display
│   ├── TrackList.tsx    # Top tracks display
│   └── ui/              # shadcn/ui primitives (Avatar, Select, Tabs…)
├── lib/
│   ├── api.ts           # Axios client + typed API call functions
│   └── utils.ts         # cn() helper (clsx + tailwind-merge)
└── types/
    └── spotify.ts       # Shared TypeScript interfaces + TimeRange type
```

### Key design decisions

**Single page, no routing complexity** — `Home.tsx` owns all state (selected user, selected time range, active tab). React Query handles data fetching and caching per `(userId, timeRange)` pair.

**No auth on the frontend** — visitors never log in. The "Connect account" button is a plain link to `GET /api/auth/spotify`. After the OAuth round-trip the page reloads and the new user appears in the picker.

**Proxy in dev, env var in prod** — `lib/api.ts` uses `VITE_API_URL` if set, otherwise falls back to `/api`. Vite's dev server proxies `/api/*` to `http://localhost:3001`, so the frontend behaves identically in both environments.

**shadcn/ui component pattern** — UI primitives live in `src/components/ui/` and are composed into feature components. The pattern follows shadcn's copy-paste model: components are owned by the project, not a library dependency.

### State & data fetching

React Query (`@tanstack/react-query`) is used for all server state:

- Queries are keyed by `['top-tracks', userId, timeRange]`, `['top-artists', ...]`, etc.
- Stale-while-revalidate caching means switching tabs is instant after the first load.
- `enabled: !!userId` guards all queries so nothing fires until a user is selected.

### Type system

`src/types/spotify.ts` is the source of truth for shared types (`SpotifyTrack`, `SpotifyArtist`, `SpotifyAlbum`, `SpotifyRecentTrack`, `TimeRange`). The API client functions are fully typed — no `any`.

## Local development

```bash
pnpm install
pnpm run dev
```

Vite starts on `http://localhost:5173`. Requests to `/api/*` are proxied to `http://localhost:3001` — no `VITE_API_URL` needed.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Production only | Full backend URL, e.g. `https://api.example.railway.app/api` |

In development this variable should be left unset.

## Scripts

| Command | Description |
|---|---|
| `pnpm run dev` | Dev server with HMR |
| `pnpm run build` | Type-check + Vite production build |
| `pnpm run preview` | Serve the production build locally |
| `pnpm run lint` | ESLint |
| `pnpm run format` | Prettier |
