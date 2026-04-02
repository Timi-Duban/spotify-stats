import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { UsersService } from '../users/users.service';
import { SpotifyUser } from '../users/user.entity';

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; width: number; height: number }[];
    release_date: string;
  };
  duration_ms: number;
  external_urls: { spotify: string };
  popularity: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string; width: number; height: number }[];
  genres: string[];
  popularity: number;
  external_urls: { spotify: string };
  followers: { total: number };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  images: { url: string; width: number; height: number }[];
  release_date: string;
  external_urls: { spotify: string };
  playCount: number;
}

export interface SpotifyRecentTrack {
  track: SpotifyTrack;
  played_at: string;
}

@Injectable()
export class SpotifyService {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  getAuthUrl(): string {
    const clientId = this.config.get<string>('SPOTIFY_CLIENT_ID');
    const redirectUri = this.config.get<string>('SPOTIFY_REDIRECT_URI');
    const scopes = [
      'user-top-read',
      'user-read-recently-played',
      'user-read-private',
    ].join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
      show_dialog: 'true',
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<SpotifyUser> {
    const clientId = this.config.get<string>('SPOTIFY_CLIENT_ID');
    const clientSecret = this.config.get<string>('SPOTIFY_CLIENT_SECRET');
    const redirectUri = this.config.get<string>('SPOTIFY_REDIRECT_URI');

    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
      },
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    const profile = await this.getProfile(access_token);

    return this.usersService.upsert({
      spotifyId: profile.id,
      displayName: profile.display_name || profile.id,
      avatarUrl: profile.images?.[0]?.url ?? '',
      accessToken: access_token,
      refreshToken: refresh_token,
      tokenExpiresAt,
    });
  }

  async getValidAccessToken(userId: string): Promise<string> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new Error('User not found');

    if (new Date() < new Date(user.tokenExpiresAt.getTime() - 60_000)) {
      return user.accessToken;
    }

    return this.refreshAccessToken(user);
  }

  private async refreshAccessToken(user: SpotifyUser): Promise<string> {
    const clientId = this.config.get<string>('SPOTIFY_CLIENT_ID');
    const clientSecret = this.config.get<string>('SPOTIFY_CLIENT_SECRET');

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: user.refreshToken,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
      },
    );

    const { access_token, expires_in } = response.data;
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000);

    await this.usersService.updateTokens(user.id, access_token, tokenExpiresAt);
    return access_token;
  }

  private async getProfile(accessToken: string) {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  }

  async getTopTracks(userId: string, timeRange: TimeRange, limit = 50): Promise<SpotifyTrack[]> {
    const token = await this.getValidAccessToken(userId);
    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
      headers: { Authorization: `Bearer ${token}` },
      params: { time_range: timeRange, limit },
    });
    return response.data.items;
  }

  async getTopArtists(userId: string, timeRange: TimeRange, limit = 50): Promise<SpotifyArtist[]> {
    const token = await this.getValidAccessToken(userId);
    const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
      headers: { Authorization: `Bearer ${token}` },
      params: { time_range: timeRange, limit },
    });
    return response.data.items;
  }

  async getTopAlbums(userId: string, timeRange: TimeRange): Promise<SpotifyAlbum[]> {
    const tracks = await this.getTopTracks(userId, timeRange, 50);

    const albumMap = new Map<string, SpotifyAlbum>();
    tracks.forEach((track, index) => {
      const { album } = track;
      if (albumMap.has(album.id)) {
        albumMap.get(album.id)!.playCount++;
      } else {
        albumMap.set(album.id, {
          id: album.id,
          name: album.name,
          artists: track.artists,
          images: album.images,
          release_date: album.release_date,
          external_urls: { spotify: `https://open.spotify.com/album/${album.id}` },
          playCount: 50 - index,
        });
      }
    });

    return Array.from(albumMap.values())
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 20);
  }

  async getRecentlyPlayed(userId: string, limit = 50): Promise<SpotifyRecentTrack[]> {
    const token = await this.getValidAccessToken(userId);
    const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
      headers: { Authorization: `Bearer ${token}` },
      params: { limit },
    });
    return response.data.items;
  }
}
