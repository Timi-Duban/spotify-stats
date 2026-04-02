import axios from 'axios';
import type {
  SpotifyUser,
  SpotifyTrack,
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyRecentTrack,
  TimeRange,
} from '@/types/spotify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export const getUsers = (): Promise<SpotifyUser[]> =>
  api.get<SpotifyUser[]>('/users').then((r) => r.data);

export const getTopTracks = (userId: string, timeRange: TimeRange): Promise<SpotifyTrack[]> =>
  api.get<SpotifyTrack[]>(`/stats/${userId}/top-tracks`, { params: { time_range: timeRange } }).then((r) => r.data);

export const getTopArtists = (userId: string, timeRange: TimeRange): Promise<SpotifyArtist[]> =>
  api.get<SpotifyArtist[]>(`/stats/${userId}/top-artists`, { params: { time_range: timeRange } }).then((r) => r.data);

export const getTopAlbums = (userId: string, timeRange: TimeRange): Promise<SpotifyAlbum[]> =>
  api.get<SpotifyAlbum[]>(`/stats/${userId}/top-albums`, { params: { time_range: timeRange } }).then((r) => r.data);

export const getRecentlyPlayed = (userId: string): Promise<SpotifyRecentTrack[]> =>
  api.get<SpotifyRecentTrack[]>(`/stats/${userId}/recent`).then((r) => r.data);

export const deleteUser = (userId: string): Promise<void> =>
  api.delete(`/users/${userId}`).then(() => undefined);
