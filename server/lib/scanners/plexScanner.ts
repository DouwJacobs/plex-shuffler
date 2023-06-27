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
    super('Plex Scan', { bundleSize: 50 });
  }

  public async run(ratingKeys: string[]): Promise<any> {
    try {
      const userRepository = getRepository(User);
      const admin = await userRepository.findOne({
        select: { id: true, plexToken: true },
        where: { id: 1 },
      });

      if (!admin) {
        this.log('No admin configured. Plex scan skipped.', 'warn');
      }

      this.plexClient = new PlexAPI({ plexToken: admin?.plexToken });

      const allEpisodes: TVShow[] = [];

      //   for (let ratingKey in ratingKeys) {
      //     const plexItem = await this.plexClient.getMetadata(ratingKeys[ratingKey]);
      //     const episodes = await this.processPlexShow(plexItem);
      //     allEpisodes.push(episodes);
      //   }

      await Promise.all(
        ratingKeys.map(async (ratingKey) => {
          const plexItem = await this.plexClient.getMetadata(ratingKey);
          const episodes = await this.processPlexShow(plexItem);
          allEpisodes.push(episodes);
        })
      );

      this.log('Scan Completed', 'info');
      return allEpisodes;
    } catch (e) {
      this.log('Scan interrupted', 'error', {
        errorMessage: e.message,
      });
    }
  }

  private async processPlexShow(plexitem: PlexLibraryItem): Promise<TVShow> {
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
      episodesMetadata.map((episode) => episodes.push(episode.ratingKey));
    }

    return { ratingKey, episodes };
  }
}

export const plexShowScanner = new PlexScanner();
