import type { PlexLibraryItem } from '@server/api/plexapi';
import PlexAPI from '@server/api/plexapi';
import { getRepository } from '@server/datasource';
import { User } from '@server/entity/User';
import BaseScanner from '@server/lib/scanners/baseScanner';

export interface TVShow {
  ratingKey: string;
  episodes: string[];
}

class PlexScanner extends BaseScanner<PlexLibraryItem> {
  private plexClient: PlexAPI;

  public constructor() {
    super('Plex Playlist', { bundleSize: 50 });
  }

  public async run(
    token: string | undefined,
    ratingKeys: string[],
    unwatched: boolean
  ): Promise<any> {
    try {
      const userRepository = getRepository(User);
      const admin = await userRepository.findOne({
        select: { id: true, plexToken: true },
        where: { id: 1 },
      });

      if (!admin) {
        this.log('No admin configured. Plex playlist creation skipped', 'warn');
      }

      this.plexClient = new PlexAPI({ plexToken: token });

      const allEpisodes: TVShow[] = [];

      //   for (let ratingKey in ratingKeys) {
      //     const plexItem = await this.plexClient.getMetadata(ratingKeys[ratingKey]);
      //     const episodes = await this.processPlexShow(plexItem);
      //     allEpisodes.push(episodes);
      //   }

      await Promise.all(
        ratingKeys.map(async (ratingKey) => {
          const plexItem = await this.plexClient.getMetadata(ratingKey);
          const episodes = await this.processPlexShow(plexItem, unwatched);
          allEpisodes.push(episodes);
        })
      );

      this.log('Playlist Created', 'info');
      return allEpisodes;
    } catch (e) {
      this.log('Playlist Creation Error', 'error', {
        errorMessage: e.message,
      });
    }
  }

  private async processPlexShow(
    plexitem: PlexLibraryItem,
    unwatched: boolean
  ): Promise<TVShow> {
    const ratingKey =
      plexitem.grandparentRatingKey ??
      plexitem.parentRatingKey ??
      plexitem.ratingKey;
    const metadata = await this.plexClient.getMetadata(ratingKey, {
      includeChildren: true,
    });

    const seasons = metadata.Children?.Metadata.map((child) => child.ratingKey);
    const episodes: string[] = [];

    for (const season of seasons ?? []) {
      const episodesMetadata = await this.plexClient.getChildrenMetadata(
        season
      );
      if (unwatched) {
        episodesMetadata.map(
          (episode) => !episode.viewCount && episodes.push(episode.ratingKey)
        );
      } else {
        episodesMetadata.map((episode) => episodes.push(episode.ratingKey));
      }
    }

    return { ratingKey, episodes };
  }
}

export const plexShowScanner = new PlexScanner();
