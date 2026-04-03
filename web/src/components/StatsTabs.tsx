import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrackList } from '@/components/TrackList';
import { ArtistList } from '@/components/ArtistList';
import { AlbumGrid } from '@/components/AlbumGrid';
import { RecentList } from '@/components/RecentList';
import type {
  SpotifyTrack,
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyRecentTrack,
} from '@/types/spotify';

interface StatsTabsProps {
  topTracks: SpotifyTrack[] | undefined;
  tracksLoading: boolean;
  topArtists: SpotifyArtist[] | undefined;
  artistsLoading: boolean;
  topAlbums: SpotifyAlbum[] | undefined;
  albumsLoading: boolean;
  recentTracks: SpotifyRecentTrack[] | undefined;
  recentLoading: boolean;
}

export function StatsTabs({
  topTracks,
  tracksLoading,
  topArtists,
  artistsLoading,
  topAlbums,
  albumsLoading,
  recentTracks,
  recentLoading,
}: StatsTabsProps) {
  return (
    <Tabs defaultValue="tracks">
      <TabsList className="mb-6 flex-wrap">
        <TabsTrigger value="tracks">Top Tracks</TabsTrigger>
        <TabsTrigger value="artists">Top Artists</TabsTrigger>
        <TabsTrigger value="albums">Top Albums</TabsTrigger>
        <TabsTrigger value="recent">Recently Played</TabsTrigger>
      </TabsList>

      <TabsContent value="tracks">
        <TrackList tracks={topTracks} isLoading={tracksLoading} />
      </TabsContent>

      <TabsContent value="artists">
        <ArtistList artists={topArtists} isLoading={artistsLoading} />
      </TabsContent>

      <TabsContent value="albums">
        <AlbumGrid albums={topAlbums} isLoading={albumsLoading} />
      </TabsContent>

      <TabsContent value="recent">
        <RecentList items={recentTracks} isLoading={recentLoading} />
      </TabsContent>
    </Tabs>
  );
}
