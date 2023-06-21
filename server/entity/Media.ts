import type { MediaType } from '@server/constants/media';
import { getRepository } from '@server/datasource';
import { getSettings } from '@server/lib/settings';
import logger from '@server/logger';
import {
  AfterLoad,
  Column,
  CreateDateColumn,
  Entity,
  In,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import Season from './Season';

@Entity()
class Media {
  public static async getRelatedMedia(
    tmdbIds: number | number[]
  ): Promise<Media[]> {
    const mediaRepository = getRepository(Media);

    try {
      let finalIds: number[];
      if (!Array.isArray(tmdbIds)) {
        finalIds = [tmdbIds];
      } else {
        finalIds = tmdbIds;
      }

      const media = await mediaRepository.find({
        where: { tmdbId: In(finalIds) },
      });

      return media;
    } catch (e) {
      logger.error(e.message);
      return [];
    }
  }

  public static async getMedia(
    id: number,
    mediaType: MediaType
  ): Promise<Media | undefined> {
    const mediaRepository = getRepository(Media);

    try {
      const media = await mediaRepository.findOne({
        where: { tmdbId: id, mediaType },
      });

      return media ?? undefined;
    } catch (e) {
      logger.error(e.message);
      return undefined;
    }
  }

  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar' })
  public mediaType: MediaType;

  @Column()
  @Index()
  public tmdbId: number;

  @Column({ unique: true, nullable: true })
  @Index()
  public tvdbId?: number;

  @Column({ nullable: true })
  @Index()
  public imdbId?: string;

  @OneToMany(() => Season, (season) => season.media, {
    cascade: true,
    eager: true,
  })
  public seasons: Season[];

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  public lastSeasonChange: Date;

  @Column({ type: 'datetime', nullable: true })
  public mediaAddedAt: Date;

  @Column({ nullable: true, type: 'int' })
  public serviceId?: number | null;

  @Column({ nullable: true, type: 'int' })
  public serviceId4k?: number | null;

  @Column({ nullable: true, type: 'int' })
  public externalServiceId?: number | null;

  @Column({ nullable: true, type: 'int' })
  public externalServiceId4k?: number | null;

  @Column({ nullable: true, type: 'varchar' })
  public externalServiceSlug?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  public externalServiceSlug4k?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  public ratingKey?: string | null;

  @Column({ nullable: true, type: 'varchar' })
  public ratingKey4k?: string | null;

  public serviceUrl?: string;
  public serviceUrl4k?: string;

  public plexUrl?: string;
  public plexUrl4k?: string;

  public iOSPlexUrl?: string;
  public iOSPlexUrl4k?: string;

  public tautulliUrl?: string;
  public tautulliUrl4k?: string;

  constructor(init?: Partial<Media>) {
    Object.assign(this, init);
  }

  @AfterLoad()
  public setPlexUrls(): void {
    const { machineId, webAppUrl } = getSettings().plex;

    if (this.ratingKey) {
      this.plexUrl = `${
        webAppUrl ? webAppUrl : 'https://app.plex.tv/desktop'
      }#!/server/${machineId}/details?key=%2Flibrary%2Fmetadata%2F${
        this.ratingKey
      }`;

      this.iOSPlexUrl = `plex://preplay/?metadataKey=%2Flibrary%2Fmetadata%2F${this.ratingKey}&server=${machineId}`;
    }

    if (this.ratingKey4k) {
      this.plexUrl4k = `${
        webAppUrl ? webAppUrl : 'https://app.plex.tv/desktop'
      }#!/server/${machineId}/details?key=%2Flibrary%2Fmetadata%2F${
        this.ratingKey4k
      }`;

      this.iOSPlexUrl4k = `plex://preplay/?metadataKey=%2Flibrary%2Fmetadata%2F${this.ratingKey4k}&server=${machineId}`;
    }
  }
}

export default Media;
