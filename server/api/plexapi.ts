import type { Library, PlexSettings } from "@server/lib/settings";
import { getSettings } from "@server/lib/settings";
import logger from "@server/logger";
import NodePlexAPI from "plex-api";

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
  type: "movie" | "show" | "season" | "episode";
  Media: Media[];
}

interface PlexLibraryResponse {
  MediaContainer: {
    totalSize: number;
    Metadata: PlexLibraryItem[];
  };
}

export interface PlexLibrary {
  type: "show" | "movie";
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
  type: "movie" | "show" | "season";
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
}

interface PlexError {
  page: number;
  results: [];
  total_pages: number;
  total_results: number;
}

interface PlexPlaylistItem {
  ratingKey: string;
  title: string;
  thumb?: string;
  summary?: string;
  type: "playlist";
}

interface PlexPlaylistResponse {
  MediaContainer: {
    size: number;
    Metadata: PlexPlaylistItem[];
  };
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
          _plexApi,
          cb: (err?: string, token?: string) => void
        ) => {
          if (!plexToken) {
            return cb("Plex Token not found!");
          }
          cb(undefined, plexToken);
        },
      },
      // requestOptions: {
      //   includeChildren: 1,
      // },
      options: {
        identifier: settings.clientId,
        product: "Plex Shuffler",
        deviceName: "Plex Shuffler",
        platform: "Plex Shuffler",
      },
    });
  }

  public async getStatus() {
    return await this.plexClient.query("/");
  }

  public async getLibraries(): Promise<PlexLibrary[]> {
    const response = await this.plexClient.query<PlexLibrariesResponse>(
      "/library/sections"
    );

    return response.MediaContainer.Directory;
  }

  public async syncLibraries(): Promise<void> {
    const settings = getSettings();

    try {
      const libraries = await this.getLibraries();

      const newLibraries: Library[] = libraries
        // Remove libraries that are not movie or show
        .filter(
          (library) => library.type === "movie" || library.type === "show"
        )
        // Remove libraries that do not have a metadata agent set (usually personal video libraries)
        .filter((library) => library.agent !== "com.plexapp.agents.none")
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
    } catch (e) {
      logger.error("Failed to fetch Plex libraries", {
        label: "Plex API",
        message: e.message,
      });

      settings.plex.libraries = [];
    }

    settings.save();
  }

  public async getLibraryContents(
    id: string,
    {
      offset = 0,
      size = 50,
      filter,
    }: { offset?: number; size?: number; filter?: string } = {}
  ): Promise<{ totalSize: number; items: PlexLibraryItem[] }> {
    try {
      const response = await this.plexClient.query<PlexLibraryResponse>({
        uri: `/library/sections/${id}/all?includeGuids=1${filter && "&title=" + filter}`,
        extraHeaders: {
            "X-Plex-Container-Start": `${offset}`,
            "X-Plex-Container-Size": `${size}`,
          },
      });

      return {
        totalSize: response.MediaContainer.totalSize,
        items: response.MediaContainer.Metadata ?? [],
      };
    } catch (e) {
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
    const response = await this.plexClient.query<PlexMetadataResponse>(
      `/library/metadata/${key}${
        options.includeChildren ? "?includeChildren=1" : ""
      }`
    );

    return response.MediaContainer.Metadata[0];
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
    mediaType: "movie" | "show"
  ): Promise<PlexLibraryItem[]> {
    const response = await this.plexClient.query<PlexLibraryResponse>({
      uri: `/library/sections/${id}/all?type=${
        mediaType === "show" ? "4" : "1"
      }&sort=addedAt%3Adesc&addedAt>>=${Math.floor(options.addedAt / 1000)}`,
      extraHeaders: {
        "X-Plex-Container-Start": `0`,
        "X-Plex-Container-Size": `500`,
      },
    });

    return response.MediaContainer.Metadata;
  }

  public async getPlaylists({
    offset = 0,
    size = 5,
    filter
  }: { offset?: number; size?: number; filter?: string } = {}): Promise<{
    offset: number;
    size: number;
    totalSize: number;
    items: PlexPlaylistItem[];
  }> {
    try {
      const response = await this.plexClient.query<PlexPlaylistResponse>({
        uri: `/playlists${filter ? "?title="+filter : ""}`,
        extraHeaders: {
          "X-Plex-Container-Start": `${offset}`,
          "X-Plex-Container-Size": `${size}`
        },
      });

      const playlistDetails = await Promise.all(
        (response.MediaContainer.Metadata ?? []).map((playlistItem) => {
          return {
            ratingKey: playlistItem.ratingKey,
            title: playlistItem.title,
            thumb: playlistItem.thumb,
            summary: playlistItem.summary,
            type: playlistItem.type,
          };
        })
      );

      return {
        offset,
        size,
        totalSize: response.MediaContainer.size,
        items: playlistDetails,
      };
    } catch (e) {
      return {
        offset,
        size,
        totalSize: 0,
        items: [],
      };
    }
  }
}

export default PlexAPI;