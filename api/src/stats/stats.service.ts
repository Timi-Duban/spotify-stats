import { Injectable } from '@nestjs/common';
import { SpotifyService, TimeRange } from '../spotify/spotify.service';

@Injectable()
export class StatsService {
  constructor(private readonly spotifyService: SpotifyService) {}

  getTopTracks(userId: string, timeRange: TimeRange) {
    return this.spotifyService.getTopTracks(userId, timeRange);
  }

  getTopArtists(userId: string, timeRange: TimeRange) {
    return this.spotifyService.getTopArtists(userId, timeRange);
  }

  getTopAlbums(userId: string, timeRange: TimeRange) {
    return this.spotifyService.getTopAlbums(userId, timeRange);
  }

  getRecentlyPlayed(userId: string) {
    return this.spotifyService.getRecentlyPlayed(userId);
  }
}
