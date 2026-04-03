import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Music2, UserPlus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AppHeader } from '@/components/AppHeader';
import { AuthBanners } from '@/components/AuthBanners';
import { UserControls } from '@/components/UserControls';
import { StatsTabs } from '@/components/StatsTabs';
import {
  getUsers,
  getTopTracks,
  getTopArtists,
  getTopAlbums,
  getRecentlyPlayed,
  deleteUser,
} from '@/lib/api';
import { type TimeRange } from '@/types/spotify';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const queryClient = useQueryClient();

  const authSuccess = searchParams.get('auth_success');
  const authError = searchParams.get('auth_error');

  useEffect(() => {
    if (authSuccess || authError) {
      setSearchParams({}, { replace: true });
    }
  }, [authSuccess, authError, setSearchParams]);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

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

  const handleDeleteUser = () => {
    if (selectedUser && confirm(`Remove ${selectedUser.displayName} from this app?`)) {
      deleteMutation.mutate(selectedUserId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8">
        <AuthBanners authSuccess={authSuccess} authError={authError} />

        {usersLoading ? (
          <div className="mb-8 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
        ) : !users?.length ? (
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
            <UserControls
              users={users}
              selectedUserId={selectedUserId}
              selectedUser={selectedUser}
              timeRange={timeRange}
              onUserChange={setSelectedUserId}
              onTimeRangeChange={setTimeRange}
              onDeleteUser={handleDeleteUser}
            />

            {!selectedUserId ? (
              <div className="flex flex-col items-center justify-center py-24">
                <p className="text-muted-foreground">Select a user to view stats</p>
              </div>
            ) : (
              <StatsTabs
                topTracks={topTracks}
                tracksLoading={tracksLoading}
                topArtists={topArtists}
                artistsLoading={artistsLoading}
                topAlbums={topAlbums}
                albumsLoading={albumsLoading}
                recentTracks={recentTracks}
                recentLoading={recentLoading}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
