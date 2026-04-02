import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { TimeRange } from '../spotify/spotify.service';

const VALID_RANGES: TimeRange[] = ['short_term', 'medium_term', 'long_term'];

function validateRange(range: string): TimeRange {
  if (!VALID_RANGES.includes(range as TimeRange)) {
    throw new BadRequestException(
      `Invalid time_range. Must be one of: ${VALID_RANGES.join(', ')}`,
    );
  }
  return range as TimeRange;
}

@Controller('stats/:userId')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('top-tracks')
  async topTracks(
    @Param('userId') userId: string,
    @Query('time_range') timeRange = 'medium_term',
  ) {
    try {
      return await this.statsService.getTopTracks(userId, validateRange(timeRange));
    } catch (err) {
      if (err.message === 'User not found') throw new NotFoundException('User not found');
      throw err;
    }
  }

  @Get('top-artists')
  async topArtists(
    @Param('userId') userId: string,
    @Query('time_range') timeRange = 'medium_term',
  ) {
    try {
      return await this.statsService.getTopArtists(userId, validateRange(timeRange));
    } catch (err) {
      if (err.message === 'User not found') throw new NotFoundException('User not found');
      throw err;
    }
  }

  @Get('top-albums')
  async topAlbums(
    @Param('userId') userId: string,
    @Query('time_range') timeRange = 'medium_term',
  ) {
    try {
      return await this.statsService.getTopAlbums(userId, validateRange(timeRange));
    } catch (err) {
      if (err.message === 'User not found') throw new NotFoundException('User not found');
      throw err;
    }
  }

  @Get('recent')
  async recentlyPlayed(@Param('userId') userId: string) {
    try {
      return await this.statsService.getRecentlyPlayed(userId);
    } catch (err) {
      if (err.message === 'User not found') throw new NotFoundException('User not found');
      throw err;
    }
  }
}
