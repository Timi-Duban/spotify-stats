import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Music2, UserPlus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { TrackList } from '@/components/TrackList';
import { ArtistList } from '@/components/ArtistList';
import { AlbumGrid } from '@/components/AlbumGrid';
import { RecentList } from '@/components/RecentList';
import {
  getUsers,
  getTopTracks,
  getTopArtists,
  getTopAlbums,
  getRecentlyPlayed,
  deleteUser,
} from '@/lib/api';
import { TIME_RANGE_LABELS, type TimeRange } from '@/types/spotify';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const queryClient = useQueryClient();

  const authSuccess = searchParams.get('auth_success');
  const authError = searchParams.get('auth_error');

  // Clear query params from URL without a redirect
  useEffect(() => {
    if (authSuccess || authError) {
      setSearchParams({}, { replace: true });
    }
  }, [authSuccess, authError, setSearchParams]);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  // Auto-select the newly connected user after OAuth, or the first user on load
  useEffect(() => {
    if (!users?.length) return;
    if (authSuccess) {
      setSelectedUserId(authSuccess);
    } else if (!selectedUserId) {
      setSelectedUserId(users[0].id);
    }
  }, [users, authSuccess]);

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      if (selectedUserId === deletedId) setSelectedUserId('');
    },
  });

  const selectedUser = users?.find((u) => u.id === selectedUserId);

  const { data: topTracks, isLoading: tracksLoading } = useQuery({
    queryKey: ['top-tracks', selectedUserId, timeRange],
    queryFn: () => getTopTracks(selectedUserId, timeRange),
    enabled: !!selectedUserId,
  });

  const { data: topArtists, isLoading: artistsLoading } = useQuery({
    queryKey: ['top-artists', selectedUserId, timeRange],
    queryFn: () => getTopArtists(selectedUserId, timeRange),
    enabled: !!selectedUserId,
  });

  const { data: topAlbums, isLoading: albumsLoading } = useQuery({
    queryKey: ['top-albums', selectedUserId, timeRange],
    queryFn: () => getTopAlbums(selectedUserId, timeRange),
    enabled: !!selectedUserId,
  });

  const { data: recentTracks, isLoading: recentLoading } = useQuery({
    queryKey: ['recent', selectedUserId],
    queryFn: () => getRecentlyPlayed(selectedUserId),
    enabled: !!selectedUserId,
  });

  return (
    <div className="min-h-screen bg-background">
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

      <main className="container mx-auto px-4 py-8">
        {/* OAuth feedback banners */}
        {authSuccess && (
          <div className="mb-6 flex items-center gap-2 rounded-md border border-green-700 bg-green-900/20 p-4 text-sm text-green-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Account connected — now showing your stats.
          </div>
        )}
        {authError && (
          <div className="mb-6 flex items-center gap-2 rounded-md border border-red-700 bg-red-900/20 p-4 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Could not connect account: {decodeURIComponent(authError)}. Please try again.
          </div>
        )}

        {usersLoading ? (
          <div className="mb-8 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
        ) : !users?.length ? (
          // Empty state — no accounts connected yet
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Music2 className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">No accounts connected yet</h2>
            <p className="mb-6 text-muted-foreground">
              Connect your Spotify account to start seeing your stats.
            </p>
            <a
              href={`${API_URL}/auth/spotify`}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <UserPlus className="h-4 w-4" />
              Connect with Spotify
            </a>
          </div>
        ) : (
          <>
            {/* Controls row */}
            <div className="mb-8 flex flex-wrap items-center gap-3">
              {selectedUser && (
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedUser.avatarUrl} />
                  <AvatarFallback>
                    {selectedUser.displayName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}

              {/* User picker */}
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Period picker */}
              <Select
                value={timeRange}
                onValueChange={(v) => setTimeRange(v as TimeRange)}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(TIME_RANGE_LABELS) as [TimeRange, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>

              {/* Remove current user */}
              {selectedUser && (
                <button
                  onClick={() => {
                    if (confirm(`Remove ${selectedUser.displayName} from this app?`)) {
                      deleteMutation.mutate(selectedUserId);
                    }
                  }}
                  className="rounded p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Remove this account"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Stats tabs */}
            {!selectedUserId ? (
              <div className="flex flex-col items-center justify-center py-24">
                <p className="text-muted-foreground">Select a user to view stats</p>
              </div>
            ) : (
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
            )}
          </>
        )}
      </main>
    </div>
  );
}
