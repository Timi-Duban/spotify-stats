# Spotify Stats

A family Spotify stats dashboard. Anyone can click **Connect account**, authorize with Spotify once, and then appear permanently in the user picker — no login required for visitors.

## Stack

- **Frontend**: Vite + React + shadcn/ui + Tailwind CSS
- **Backend**: NestJS + TypeORM
- **Database**: PostgreSQL
- **Hosting**: Railway

## How it works

1. A family member visits the site and clicks **Connect account** (top-right)
2. They authorize on Spotify's page — their tokens are stored in PostgreSQL
3. They now appear in the user picker permanently
4. Any visitor can pick any connected user and a time period to view their stats — **no login required**

> **Why can't I just enter a Spotify user ID?**
> Spotify's listening history (`top tracks`, `top artists`, `recently played`) is private — it's only accessible via an OAuth token belonging to that specific user. Public data for arbitrary user IDs is limited to profiles and public playlists.

## Local development

### Prerequisites

- Node.js 20+ (see `.nvmrc`)
- PostgreSQL running locally
- A [Spotify Developer App](https://developer.spotify.com/dashboard) (free)

```bash
nvm use   # picks up .nvmrc
```

### Backend

```bash
cd api
cp .env.example .env
# Fill in your Spotify credentials
pnpm install
pnpm run start:dev
```

### Frontend

```bash
cd web
pnpm install
pnpm run dev
```

Vite proxies `/api/*` → `http://localhost:3001` in dev, so no `VITE_API_URL` needed locally.

### Environment variables

**API** (`api/.env`):

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SPOTIFY_CLIENT_ID` | From Spotify Developer Dashboard |
| `SPOTIFY_CLIENT_SECRET` | From Spotify Developer Dashboard |
| `SPOTIFY_REDIRECT_URI` | e.g. `http://localhost:3001/api/auth/callback` |
| `FRONTEND_URL` | e.g. `http://localhost:5173` (for OAuth redirect back) |
| `PORT` | API port (default: `3001`) |

**Web** (`web/.env.local`, production only):

| Variable | Description |
|---|---|
| `VITE_API_URL` | Full backend URL, e.g. `https://api.example.railway.app/api` |

In dev, leave `VITE_API_URL` unset — Vite's proxy handles it automatically.

## Deployment on Railway

1. Push this repo to GitHub (public)
2. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** → select repo
3. Add a **PostgreSQL** plugin — Railway injects `DATABASE_URL` automatically
4. Create **two services**:
   - `api` (root: `api/`) with env vars from the table above
   - `web` (root: `web/`) with `VITE_API_URL=https://YOUR-API.railway.app/api`
5. In your Spotify Developer App, add the production callback to **Redirect URIs**:
   `https://YOUR-API.railway.app/api/auth/callback`

## Spotify Developer App setup

1. [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) → **Create app** (free)
2. Add redirect URIs for local + production
3. Copy **Client ID** and **Client Secret** → paste into env vars
4. No Spotify Premium required

## Time periods

| Value | Label |
|---|---|
| `short_term` | Last 4 weeks |
| `medium_term` | Last 6 months |
| `long_term` | All time |

These are the only periods Spotify's API supports.
