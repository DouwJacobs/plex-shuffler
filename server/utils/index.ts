import { getSettings } from '@server/lib/settings';

export const getPlexUrl = () => {
  const settings = getSettings();
  return `${settings.plex.useSsl ? 'https' : 'http'}://${settings.plex.ip}:${
    settings.plex.port
  }`;
};
