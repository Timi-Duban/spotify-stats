import { Module } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [SpotifyService],
  exports: [SpotifyService],
})
export class SpotifyModule {}
