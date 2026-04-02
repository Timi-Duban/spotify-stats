import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { SpotifyService } from '../spotify/spotify.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly spotifyService: SpotifyService,
    private readonly config: ConfigService,
  ) {}

  /** Kick off Spotify OAuth for a new user. */
  @Get('spotify')
  initiateAuth(@Res() res: Response) {
    const url = this.spotifyService.getAuthUrl();
    return res.redirect(url);
  }

  /** Spotify redirects here after the user authorizes. */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    if (error) {
      return res.redirect(`${frontendUrl}?auth_error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return res.redirect(`${frontendUrl}?auth_error=missing_code`);
    }

    try {
      const user = await this.spotifyService.exchangeCode(code);
      return res.redirect(`${frontendUrl}?auth_success=${encodeURIComponent(user.id)}`);
    } catch (err) {
      console.error('OAuth callback error:', err?.response?.data ?? err.message);
      return res.redirect(`${frontendUrl}?auth_error=exchange_failed`);
    }
  }
}
