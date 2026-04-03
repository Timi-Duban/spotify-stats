# Spotify Stats — API

NestJS REST API that handles Spotify OAuth and proxies listening-history requests on behalf of stored users.

## Architecture

```
src/
├── main.ts              # Bootstrap: CORS, global prefix (/api), port
├── app.module.ts        # Root module — wires TypeORM, ConfigModule, feature modules
├── auth/                # OAuth flow (initiate + callback)
├── spotify/             # Spotify API client (token refresh, data fetching)
├── stats/               # Stats endpoints (top tracks / artists / albums, recent)
└── users/               # User CRUD + TypeORM entity
```

### Module breakdown

| Module | Responsibility |
|---|---|
| `AuthModule` | `GET /api/auth/spotify` — redirect to Spotify; `GET /api/auth/callback` — exchange code, upsert user |
| `SpotifyModule` | `SpotifyService` — builds the OAuth URL, exchanges the code, refreshes access tokens on demand, calls Spotify Web API |
| `StatsModule` | `GET /api/stats/:userId/top-tracks|top-artists|top-albums|recent` — validates `time_range`, delegates to `SpotifyService` |
| `UsersModule` | `GET /api/users` — list all connected users; `DELETE /api/users/:id` — remove a user |

### Data flow

```
Browser → GET /api/auth/spotify
        → redirect to accounts.spotify.com
        → GET /api/auth/callback?code=…
        → exchange code → store SpotifyUser in DB
        → redirect to frontend with ?auth_success=<userId>

Browser → GET /api/stats/:userId/top-tracks?time_range=medium_term
        → UsersService.findOne(userId)          # load tokens from DB
        → SpotifyService.refreshIfNeeded()      # auto-refresh expired token
        → Spotify Web API /me/top/tracks
        → return shaped response
```

### Token refresh strategy

`SpotifyService` checks `tokenExpiresAt` before every API call. If the token is expired (or within 60 s of expiry) it calls the Spotify `/token` endpoint with the stored `refreshToken`, updates the row, and proceeds transparently. No background job needed — refresh is lazy and per-request.

### Database

Single table `spotify_users` managed by TypeORM with `synchronize: true` (auto-migration on start). SSL is enabled in production and disabled in local dev.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Internal primary key |
| `spotifyId` | varchar (unique) | Spotify user ID — used for upsert |
| `displayName` | varchar | Display name from Spotify profile |
| `avatarUrl` | varchar (nullable) | Profile image URL |
| `accessToken` | text | Current OAuth access token |
| `refreshToken` | text | Long-lived refresh token |
| `tokenExpiresAt` | timestamptz | Used to trigger lazy refresh |
| `createdAt` / `updatedAt` | timestamptz | Managed by TypeORM |

## API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/auth/spotify` | Start OAuth flow |
| `GET` | `/api/auth/callback` | Spotify OAuth callback |
| `GET` | `/api/users` | List all connected users |
| `DELETE` | `/api/users/:id` | Remove a user |
| `GET` | `/api/stats/:userId/top-tracks` | Top tracks (`time_range` query param) |
| `GET` | `/api/stats/:userId/top-artists` | Top artists (`time_range` query param) |
| `GET` | `/api/stats/:userId/top-albums` | Top albums (derived from top tracks) |
| `GET` | `/api/stats/:userId/recent` | Recently played tracks |

`time_range` values: `short_term` (4 weeks) · `medium_term` (6 months) · `long_term` (all time)

## Local development

```bash
cp .env.example .env   # fill in Spotify credentials + DATABASE_URL
pnpm install
pnpm run start:dev     # watch mode, restarts on file change
```

The server starts on `http://localhost:3001`. All routes are prefixed with `/api`.

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SPOTIFY_CLIENT_ID` | From Spotify Developer Dashboard |
| `SPOTIFY_CLIENT_SECRET` | From Spotify Developer Dashboard |
| `SPOTIFY_REDIRECT_URI` | e.g. `http://localhost:3001/api/auth/callback` |
| `FRONTEND_URL` | e.g. `http://localhost:5173` (used for post-OAuth redirect) |
| `PORT` | Port to listen on (default: `3001`) |

## Scripts

| Command | Description |
|---|---|
| `pnpm run start:dev` | Watch mode (development) |
| `pnpm run build` | Compile TypeScript via `nest build` |
| `pnpm run start:prod` | Run compiled output (`node dist/main`) |
| `pnpm run lint` | ESLint |
| `pnpm run format` | Prettier |
