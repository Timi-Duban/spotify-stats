import { UserPlus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function AppHeader() {
  return (
    <header className="border-b border-border">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img src="/spotify.svg" alt="Spotify" className="h-7 w-7" />
          <h1 className="text-lg font-bold">Spotify Stats</h1>
        </div>

        <a
          href={`${API_URL}/auth/spotify`}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <UserPlus className="h-4 w-4" />
          Connect account
        </a>
      </div>
    </header>
  );
}
