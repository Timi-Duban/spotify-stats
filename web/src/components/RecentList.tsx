import { Skeleton } from '@/components/ui/skeleton';
import { formatDuration } from '@/lib/utils';
import type { SpotifyRecentTrack } from '@/types/spotify';

interface RecentListProps {
  items: SpotifyRecentTrack[] | undefined;
  isLoading: boolean;
}

function formatPlayedAt(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffMins = Math.floor(diffMs / 60000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function RecentList({ items, isLoading }: RecentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-12 w-12 shrink-0 rounded" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    );
  }

  if (!items?.length) {
    return <p className="py-8 text-center text-muted-foreground">No recent tracks found.</p>;
  }

  return (
    <div className="space-y-1">
      {items.map((item, index) => {
        const { track } = item;
        const image =
          track.album.images.find((img) => img.width <= 64) ??
          track.album.images[track.album.images.length - 1];
        return (
          <a
            key={`${track.id}-${index}`}
            href={track.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-secondary"
          >
            <img
              src={image?.url}
              alt={track.album.name}
              className="h-12 w-12 shrink-0 rounded object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{track.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {track.artists.map((a) => a.name).join(', ')}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs text-muted-foreground">{formatDuration(track.duration_ms)}</p>
              <p className="text-xs text-muted-foreground">{formatPlayedAt(item.played_at)}</p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
