import { ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { SpotifyAlbum } from '@/types/spotify';

interface AlbumGridProps {
  albums: SpotifyAlbum[] | undefined;
  isLoading: boolean;
}

export function AlbumGrid({ albums, isLoading }: AlbumGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square w-full rounded-md" />
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!albums?.length) {
    return <p className="py-8 text-center text-muted-foreground">No albums found.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {albums.map((album, index) => {
        const image = album.images[0];
        return (
          <a
            key={album.id}
            href={album.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="group space-y-2"
          >
            <div className="relative overflow-hidden rounded-md">
              <img
                src={image?.url}
                alt={album.name}
                className="aspect-square w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <ExternalLink className="h-6 w-6 text-white" />
              </div>
              <span className="absolute left-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-bold text-white">
                #{index + 1}
              </span>
            </div>
            <div>
              <p className="truncate text-sm font-medium">{album.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {album.artists.map((a) => a.name).join(', ')}
              </p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
