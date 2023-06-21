import { randomUUID } from 'crypto';
import fs from 'fs';
import { merge } from 'lodash';
import path from 'path';
import webpush from 'web-push';
import { Permission } from './permissions';

export interface Library {
  id: string;
  name: string;
  enabled: boolean;
  type: 'show' | 'movie';
  lastScan?: number;
}

export interface PlexSettings {
  name: string;
  machineId?: string;
  ip: string;
  port: number;
  useSsl?: boolean;
  libraries: Library[];
  webAppUrl?: string;
}

export interface MainSettings {
  apiKey: string;
  applicationTitle: string;
  applicationUrl: string;
  csrfProtection: boolean;
  cacheImages: boolean;
  defaultPermissions: number;
  trustProxy: boolean;
  hideAvailable: boolean;
  newPlexLogin: boolean;
  region: string;
  originalLanguage: string;
  locale: string;
}

interface PublicSettings {
  initialized: boolean;
}

interface FullPublicSettings extends PublicSettings {
  applicationTitle: string;
  applicationUrl: string;
  cacheImages: boolean;
  vapidPublic: string;
  newPlexLogin: boolean;
  region: string;
  originalLanguage: string;
  locale: string;
}

interface AllSettings {
  clientId: string;
  vapidPublic: string;
  vapidPrivate: string;
  main: MainSettings;
  plex: PlexSettings;
  public: PublicSettings;
}

export interface Region {
  iso_3166_1: string;
  english_name: string;
  name?: string;
}

export interface Language {
  iso_639_1: string;
  english_name: string;
  name: string;
}

const SETTINGS_PATH = process.env.CONFIG_DIRECTORY
  ? `${process.env.CONFIG_DIRECTORY}/settings.json`
  : path.join(__dirname, '../../config/settings.json');

class Settings {
  private data: AllSettings;

  constructor(initialSettings?: AllSettings) {
    this.data = {
      clientId: randomUUID(),
      vapidPrivate: '',
      vapidPublic: '',
      main: {
        apiKey: '',
        applicationTitle: 'Plex Shuffler',
        applicationUrl: '',
        trustProxy: true,
        csrfProtection: false,
        cacheImages: false,
        defaultPermissions: Permission.STANDARD_USER,
        hideAvailable: false,
        newPlexLogin: true,
        region: '',
        originalLanguage: '',
        locale: 'en',
      },
      plex: {
        name: '',
        ip: '',
        port: 32400,
        useSsl: false,
        libraries: [],
      },
      public: {
        initialized: false,
      },
    };
    if (initialSettings) {
      this.data = merge(this.data, initialSettings);
    }
  }

  get main(): MainSettings {
    if (!this.data.main.apiKey) {
      this.data.main.apiKey = this.generateApiKey();
      this.save();
    }
    return this.data.main;
  }

  set main(data: MainSettings) {
    this.data.main = data;
  }

  get plex(): PlexSettings {
    return this.data.plex;
  }

  set plex(data: PlexSettings) {
    this.data.plex = data;
  }

  get public(): PublicSettings {
    return this.data.public;
  }

  set public(data: PublicSettings) {
    this.data.public = data;
  }

  get fullPublicSettings(): FullPublicSettings {
    return {
      ...this.data.public,
      applicationTitle: this.data.main.applicationTitle,
      applicationUrl: this.data.main.applicationUrl,
      cacheImages: this.data.main.cacheImages,
      vapidPublic: this.vapidPublic,
      newPlexLogin: this.data.main.newPlexLogin,
      region: this.data.main.region,
      originalLanguage: this.data.main.originalLanguage,
      locale: this.data.main.locale,
    };
  }

  get clientId(): string {
    if (!this.data.clientId) {
      this.data.clientId = randomUUID();
      this.save();
    }

    return this.data.clientId;
  }

  get vapidPublic(): string {
    this.generateVapidKeys();

    return this.data.vapidPublic;
  }

  get vapidPrivate(): string {
    this.generateVapidKeys();

    return this.data.vapidPrivate;
  }

  public regenerateApiKey(): MainSettings {
    this.main.apiKey = this.generateApiKey();
    this.save();
    return this.main;
  }

  private generateApiKey(): string {
    return Buffer.from(`${Date.now()}${randomUUID()}`).toString('base64');
  }

  private generateVapidKeys(force = false): void {
    if (!this.data.vapidPublic || !this.data.vapidPrivate || force) {
      const vapidKeys = webpush.generateVAPIDKeys();
      this.data.vapidPrivate = vapidKeys.privateKey;
      this.data.vapidPublic = vapidKeys.publicKey;
      this.save();
    }
  }

  /**
   * Settings Load
   *
   * This will load settings from file unless an optional argument of the object structure
   * is passed in.
   * @param overrideSettings If passed in, will override all existing settings with these
   * values
   */
  public load(overrideSettings?: AllSettings): Settings {
    if (overrideSettings) {
      this.data = overrideSettings;
      return this;
    }

    if (!fs.existsSync(SETTINGS_PATH)) {
      this.save();
    }
    const data = fs.readFileSync(SETTINGS_PATH, 'utf-8');

    if (data) {
      this.data = merge(this.data, JSON.parse(data));
      this.save();
    }
    return this;
  }

  public save(): void {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(this.data, undefined, ' '));
  }
}

let settings: Settings | undefined;

export const getSettings = (initialSettings?: AllSettings): Settings => {
  if (!settings) {
    settings = new Settings(initialSettings);
  }

  return settings;
};

export default Settings;
