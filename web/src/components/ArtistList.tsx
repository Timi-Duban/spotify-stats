import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import type { SpotifyArtist } from '@/types/spotify';

interface ArtistListProps {
  artists: SpotifyArtist[] | undefined;
  isLoading: boolean;
}

export function ArtistList({ artists, isLoading }: ArtistListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <Skeleton className="h-4 w-6 shrink-0" />
            <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!artists?.length) {
    return <p className="py-8 text-center text-muted-foreground">No artists found.</p>;
  }

  return (
    <div className="grid gap-1 sm:grid-cols-2">
      {artists.map((artist, index) => {
        const image = artist.images.find((img) => img.width <= 160) ?? artist.images[artist.images.length - 1];
        return (
          <a
            key={artist.id}
            href={artist.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-secondary"
          >
            <span className="w-6 shrink-0 text-right text-sm text-muted-foreground">
              {index + 1}
            </span>
            <img
              src={image?.url}
              alt={artist.name}
              className="h-14 w-14 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{artist.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(artist.followers?.total ?? 0)} followers
              </p>
              {(artist.genres ?? []).slice(0, 2).map((g) => (
                <Badge key={g} variant="secondary" className="mr-1 mt-1 text-[10px]">
                  {g}
                </Badge>
              ))}
            </div>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-50" />
          </a>
        );
      })}
    </div>
  );
}
