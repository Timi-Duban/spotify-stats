export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  short_term: 'Last 4 weeks',
  medium_term: 'Last 6 months',
  long_term: 'All time',
};

export interface SpotifyUser {
  id: string;
  spotifyId: string;
  displayName: string;
  avatarUrl: string;
}

export interface SpotifyImage {
  url: string;
  width: number;
  height: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: SpotifyImage[];
    release_date: string;
  };
  duration_ms: number;
  external_urls: { spotify: string };
  popularity: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
  genres: string[];
  popularity: number;
  external_urls: { spotify: string };
  followers: { total: number };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  images: SpotifyImage[];
  release_date: string;
  external_urls: { spotify: string };
  playCount: number;
}

export interface SpotifyRecentTrack {
  track: SpotifyTrack;
  played_at: string;
}
