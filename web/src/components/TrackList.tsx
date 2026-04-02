import { ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDuration } from '@/lib/utils';
import type { SpotifyTrack } from '@/types/spotify';

interface TrackListProps {
  tracks: SpotifyTrack[] | undefined;
  isLoading: boolean;
}

export function TrackList({ tracks, isLoading }: TrackListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-4 w-6 shrink-0" />
            <Skeleton className="h-12 w-12 shrink-0 rounded" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-3 w-10" />
          </div>
        ))}
      </div>
    );
  }

  if (!tracks?.length) {
    return <p className="py-8 text-center text-muted-foreground">No tracks found.</p>;
  }

  return (
    <div className="space-y-1">
      {tracks.map((track, index) => {
        const image = track.album.images.find((img) => img.width <= 64) ?? track.album.images[track.album.images.length - 1];
        return (
          <a
            key={track.id}
            href={track.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-secondary"
          >
            <span className="w-6 shrink-0 text-right text-sm text-muted-foreground">
              {index + 1}
            </span>
            <img
              src={image?.url}
              alt={track.album.name}
              className="h-12 w-12 shrink-0 rounded object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{track.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {track.artists.map((a) => a.name).join(', ')}
                {' · '}
                {track.album.name}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatDuration(track.duration_ms)}
            </span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-50" />
          </a>
        );
      })}
    </div>
  );
}
