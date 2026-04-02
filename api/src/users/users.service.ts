import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SpotifyUser } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(SpotifyUser)
    private readonly repo: Repository<SpotifyUser>,
  ) {}

  findAll(): Promise<Pick<SpotifyUser, 'id' | 'spotifyId' | 'displayName' | 'avatarUrl'>[]> {
    return this.repo.find({
      select: ['id', 'spotifyId', 'displayName', 'avatarUrl'],
      order: { displayName: 'ASC' },
    });
  }

  findById(id: string): Promise<SpotifyUser | null> {
    return this.repo.findOne({ where: { id } });
  }

  findBySpotifyId(spotifyId: string): Promise<SpotifyUser | null> {
    return this.repo.findOne({ where: { spotifyId } });
  }

  async upsert(data: {
    spotifyId: string;
    displayName: string;
    avatarUrl: string;
    accessToken: string;
    refreshToken: string;
    tokenExpiresAt: Date;
  }): Promise<SpotifyUser> {
    const existing = await this.findBySpotifyId(data.spotifyId);
    if (existing) {
      return this.repo.save({ ...existing, ...data });
    }
    return this.repo.save(this.repo.create(data));
  }

  async updateTokens(
    id: string,
    accessToken: string,
    tokenExpiresAt: Date,
  ): Promise<void> {
    await this.repo.update(id, { accessToken, tokenExpiresAt });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
