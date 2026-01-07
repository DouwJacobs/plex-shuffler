import type { Library, PlexSettings } from '@server/lib/settings';
import { getSettings } from '@server/lib/settings';
import logger from '@server/logger';
import NodePlexAPI from 'plex-api';

export interface PlexLibraryItem {
  ratingKey: string;
  parentRatingKey?: string;
  grandparentRatingKey?: string;
  title: string;
  guid: string;
  parentGuid?: string;
  grandparentGuid?: string;
  addedAt: number;
  updatedAt: number;
  thumb?: string;
  summary?: string;
  Guid?: {
    id: string;
  }[];
  type: 'movie' | 'show' | 'season' | 'episode';
  Media: Media[];
}

interface PlexLibraryResponse {
  MediaContainer: {
    totalSize: number;
    Metadata: PlexLibraryItem[];
  };
}

export interface PlexLibrary {
  type: 'show' | 'movie';
  key: string;
  title: string;
  agent: string;
}

interface PlexLibrariesResponse {
  MediaContainer: {
    Directory: PlexLibrary[];
  };
}

export interface PlexMetadata {
  ratingKey: string;
  parentRatingKey?: string;
  guid: string;
  type: 'movie' | 'show' | 'season';
  title: string;
  Guid: {
    id: string;
  }[];
  Children?: {
    size: 12;
    Metadata: PlexMetadata[];
  };
  index: number;
  parentIndex?: number;
  leafCount: number;
  viewedLeafCount: number;
  addedAt: number;
  updatedAt: number;
  Media: Media[];
  thumb?: string;
  summary?: string;
  viewCount?: string;
}
interface PlexPlaylistItem {
  ratingKey: string;
  title: string;
  thumb?: string;
  summary?: string;
  type: 'playlist';
}

interface PlexPlaylistResponse {
  MediaContainer: {
    size: number;
    Metadata: PlexPlaylistItem[];
  };
}

interface PlexCreatePlaylistResponse {
  MediaContainer: {
    size: number;
    Metadata: PlexPlaylistItem[];
  };
}

interface PlexIdentityRepsonse {
  MediaContainer: {
    size: string;
    claimed: string;
    machineIdentifier: string;
    version: string;
  };
}

interface PlexIdentity {
  machineIdentifier: string;
}

interface Media {
  id: number;
  duration: number;
  bitrate: number;
  width: number;
  height: number;
  aspectRatio: number;
  audioChannels: number;
  audioCodec: string;
  videoCodec: string;
  videoResolution: string;
  container: string;
  videoFrameRate: string;
  videoProfile: string;
}

interface PlexMetadataResponse {
  MediaContainer: {
    Metadata: PlexMetadata[];
    size?: number;
  };
}

class PlexAPI {
  private plexClient: NodePlexAPI;

  constructor({
    plexToken,
    plexSettings,
    timeout,
  }: {
    plexToken?: string;
    plexSettings?: PlexSettings;
    timeout?: number;
  }) {
    const settings = getSettings();
    let settingsPlex: PlexSettings | undefined;
    plexSettings
      ? (settingsPlex = plexSettings)
      : (settingsPlex = getSettings().plex);

    this.plexClient = new NodePlexAPI({
      hostname: settingsPlex.ip,
      port: settingsPlex.port,
      https: settingsPlex.useSsl,
      timeout: timeout,
      token: plexToken,
      authenticator: {
        authenticate: (
          _plexApi: NodePlexAPI,
          cb: (err?: string, token?: string) => void
        ) => {
          if (!plexToken) {
            return cb('Plex Token not found!');
          }
          cb(undefined, plexToken);
        },
      },
      // requestOptions: {
      //   includeChildren: 1,
      // },
      options: {
        identifier: settings.clientId,
        product: 'Plex Shuffler',
        deviceName: 'Plex Shuffler',
        platform: 'Plex Shuffler',
      },
    });
  }

  public async getStatus() {
    logger.debug('Getting Plex server status', { label: 'Plex API' });
    const result = await this.plexClient.query('/');
    logger.debug('Plex server status retrieved', {
      label: 'Plex API',
      machineIdentifier: result?.MediaContainer?.machineIdentifier,
    });
    return result;
  }

  public async getLibraries(): Promise<PlexLibrary[]> {
    logger.debug('Fetching Plex libraries', { label: 'Plex API' });
    const response = await this.plexClient.query<PlexLibrariesResponse>(
      '/library/sections'
    );

    const libraries = response.MediaContainer.Directory;
    logger.info('Plex libraries retrieved', {
      label: 'Plex API',
      libraryCount: libraries.length,
    });
    return libraries;
  }

  public async syncLibraries(): Promise<void> {
    logger.info('Syncing Plex libraries', { label: 'Plex API' });
    const settings = getSettings();

    try {
      const libraries = await this.getLibraries();
      logger.debug('Processing libraries for sync', {
        label: 'Plex API',
        totalLibraries: libraries.length,
      });

      const newLibraries: Library[] = libraries
        // Remove libraries that are not movie or show
        .filter(
          (library) => library.type === 'movie' || library.type === 'show'
        )
        // Remove libraries that do not have a metadata agent set (usually personal video libraries)
        .filter((library) => library.agent !== 'com.plexapp.agents.none')
        .map((library) => {
          const existing = settings.plex.libraries.find(
            (l) => l.id === library.key && l.name === library.title
          );

          return {
            id: library.key,
            name: library.title,
            enabled: existing?.enabled ?? false,
            type: library.type,
            lastScan: existing?.lastScan,
          };
        });

      settings.plex.libraries = newLibraries;
      logger.info('Plex libraries synced successfully', {
        label: 'Plex API',
        libraryCount: newLibraries.length,
        enabledCount: newLibraries.filter((lib) => lib.enabled).length,
      });
    } catch (e) {
      logger.error('Failed to fetch Plex libraries', {
        label: 'Plex API',
        message: e.message,
      });

      settings.plex.libraries = [];
    }

    settings.save();
  }

  public async getLibraryContents(
    id: string | number,
    {
      offset = 0,
      size = 50,
      filter,
      genre,
      sortBy,
    }: {
      offset?: number;
      size?: number;
      filter?: string;
      genre?: string;
      sortBy?: string;
    } = {}
  ): Promise<{ totalSize: number; items: PlexLibraryItem[] }> {
    logger.debug('Fetching library contents', {
      label: 'Plex API',
      libraryId: id,
      offset,
      size,
      filter,
      genre,
      sortBy,
    });
    try {
      const response = await this.plexClient.query<PlexLibraryResponse>({
        uri: `/library/sections/${id}/all?includeGuids=1${
          filter && '&title=' + filter
        }${![undefined, 'all'].includes(genre) && '&genre=' + genre}${
          sortBy && '&sort=' + sortBy
        }`,
        extraHeaders: {
          'X-Plex-Container-Start': `${offset}`,
          'X-Plex-Container-Size': `${size}`,
        },
      });

      const result = {
        totalSize: response.MediaContainer.totalSize,
        items: response.MediaContainer.Metadata ?? [],
      };
      logger.debug('Library contents retrieved', {
        label: 'Plex API',
        libraryId: id,
        totalSize: result.totalSize,
        itemsReturned: result.items.length,
      });
      return result;
    } catch (e) {
      logger.error('Failed to fetch library contents', {
        label: 'Plex API',
        libraryId: id,
        error: e.message,
      });
      return {
        totalSize: 0,
        items: [],
      };
    }
  }

  public async getMetadata(
    key: string,
    options: { includeChildren?: boolean } = {}
  ): Promise<PlexMetadata> {
    logger.debug('Fetching metadata', {
      label: 'Plex API',
      ratingKey: key,
      includeChildren: options.includeChildren,
    });
    const response = await this.plexClient.query<PlexMetadataResponse>(
      `/library/metadata/${key}${
        options.includeChildren ? '?includeChildren=1' : ''
      }`
    );

    const metadata = response.MediaContainer.Metadata[0];
    logger.debug('Metadata retrieved', {
      label: 'Plex API',
      ratingKey: key,
      type: metadata?.type,
      title: metadata?.title,
    });
    return metadata;
  }

  public async getMultipleMetadata(
    key: string,
    options: { includeChildren?: boolean } = {}
  ): Promise<{ Metadata: PlexMetadata[]; size?: number }> {
    logger.debug('Fetching multiple metadata', {
      label: 'Plex API',
      ratingKeys: key,
      includeChildren: options.includeChildren,
    });
    const response = await this.plexClient.query<PlexMetadataResponse>(
      `/library/metadata/${key}${
        options.includeChildren ? '?includeChildren=1' : ''
      }`
    );

    const result = response.MediaContainer;
    logger.debug('Multiple metadata retrieved', {
      label: 'Plex API',
      count: result.size || result.Metadata?.length || 0,
    });
    return result;
  }

  public async getChildrenMetadata(key: string): Promise<PlexMetadata[]> {
    const response = await this.plexClient.query<PlexMetadataResponse>(
      `/library/metadata/${key}/children`
    );

    return response.MediaContainer.Metadata;
  }

  public async getRecentlyAdded(
    id: string,
    options: { addedAt: number } = {
      addedAt: Date.now() - 1000 * 60 * 60,
    },
    mediaType: 'movie' | 'show'
  ): Promise<PlexLibraryItem[]> {
    const response = await this.plexClient.query<PlexLibraryResponse>({
      uri: `/library/sections/${id}/all?type=${
        mediaType === 'show' ? '4' : '1'
      }&sort=addedAt%3Adesc&addedAt>>=${Math.floor(options.addedAt / 1000)}`,
      extraHeaders: {
        'X-Plex-Container-Start': `0`,
        'X-Plex-Container-Size': `500`,
      },
    });

    return response.MediaContainer.Metadata;
  }

  public async getPlaylists({
    offset = 0,
    size = 5,
    filter,
    userToken,
  }: {
    offset?: number;
    size?: number;
    filter?: string;
    userToken?: string;
  } = {}): Promise<{
    offset: number;
    size: number;
    totalSize: number;
    items: PlexPlaylistItem[];
  }> {
    logger.debug('Fetching playlists', {
      label: 'Plex API',
      offset,
      size,
      filter,
      hasUserToken: !!userToken,
    });
    try {
      const response = await this.plexClient.query<PlexPlaylistResponse>({
        uri: `/playlists/all?X-Plex-Token=${userToken}${
          filter ? '&title=' + filter : ''
        }`,
        extraHeaders: {
          'X-Plex-Container-Start': `${offset}`,
          'X-Plex-Container-Size': `${size}`,
        },
      });

      const playlistDetails = await Promise.all(
        (response.MediaContainer.Metadata ?? []).map((playlistItem: any) => {
          return {
            ratingKey: playlistItem.ratingKey,
            title: playlistItem.title,
            thumb: playlistItem.thumb,
            summary: playlistItem.summary,
            type: playlistItem.type,
          };
        })
      );

      const result = {
        offset,
        size,
        totalSize: response.MediaContainer.size,
        items: playlistDetails,
      };
      logger.debug('Playlists retrieved', {
        label: 'Plex API',
        totalSize: result.totalSize,
        itemsReturned: result.items.length,
      });
      return result;
    } catch (e) {
      logger.error('Failed to fetch playlists', {
        label: 'Plex API',
        error: e.message,
      });
      return {
        offset,
        size,
        totalSize: 0,
        items: [],
      };
    }
  }

  public async getIdentity(): Promise<PlexIdentity> {
    const response = await this.plexClient.query<PlexIdentityRepsonse>(
      `/identity`
    );
    return response.MediaContainer;
  }

  public async createPlaylist(
    title: string,
    ratingKeys: string[],
    userToken: string | undefined
  ): Promise<PlexPlaylistItem[] | undefined> {
    logger.info('Creating Plex playlist', {
      label: 'Plex API',
      title,
      itemCount: ratingKeys.length,
      hasUserToken: !!userToken,
    });
    try {
      const plexIdentity = await this.getIdentity();
      const machineId = plexIdentity.machineIdentifier;
      logger.debug('Plex identity retrieved for playlist creation', {
        label: 'Plex API',
        machineId,
      });

      const response =
        await this.plexClient.postQuery<PlexCreatePlaylistResponse>({
          uri: `/playlists?type=video&title=${title}&smart=0&uri=server://${machineId}/com.plexapp.plugins.library/library/metadata/${ratingKeys.join(
            ','
          )}&X-Plex-Token=${userToken}`,
        });

      const result = response.MediaContainer.Metadata;
      logger.info('Plex playlist created successfully', {
        label: 'Plex API',
        title,
        ratingKey: result[0]?.ratingKey,
        itemCount: ratingKeys.length,
      });
      return result;
    } catch (e) {
      logger.error('Failed to create Plex Playlist', {
        label: 'Plex API',
        title,
        itemCount: ratingKeys.length,
        message: e.message,
      });
    }
  }

  public async editPlaylist({
    ratingKey,
    userToken,
    title,
    summary,
    thumb,
  }: {
    ratingKey: string | undefined;
    userToken: string | undefined;
    title?: string;
    summary?: string;
    thumb?: string;
  }): Promise<{ status: number; message: string } | undefined> {
    logger.info('Editing Plex playlist', {
      label: 'Plex API',
      ratingKey,
      hasTitle: !!title,
      hasSummary: !!summary,
      hasThumb: !!thumb,
    });
    try {
      await this.plexClient.putQuery<PlexCreatePlaylistResponse>({
        uri: `/playlists/${ratingKey}?X-Plex-Token=${userToken}${
          title && `&title=${title}`
        }${summary && `&summary=${summary}`}`,
      });

      if (thumb) {
        logger.debug('Uploading playlist cover', {
          label: 'Plex API',
          ratingKey,
        });
        await this.plexClient.postQuery<PlexCreatePlaylistResponse>({
          uri: `/library/metadata/${ratingKey}/posters?X-Plex-Token=${userToken}&url=${thumb}`,
        });
      }
      logger.info('Plex playlist edited successfully', {
        label: 'Plex API',
        ratingKey,
      });
    } catch (e) {
      logger.error('Failed to edit Plex Playlist', {
        label: 'Plex API',
        ratingKey,
        message: e.message,
      });

      return { status: 406, message: 'Unable to upload playlist cover url' };
    }
  }
}

export default PlexAPI;
