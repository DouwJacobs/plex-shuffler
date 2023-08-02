import {
  ArrowUpCircleIcon,
  BeakerIcon,
  CodeBracketIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';
import type { StatusResponse } from '@server/interfaces/api/settingsInterfaces';
import Link from 'next/link';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';

const messages = defineMessages({
  streamdevelop: 'Plex Shuffler Development',
  streamstable: 'Plex Shuffler Stable',
  outofdate: 'Out of Date',
  commitsbehind:
    '{commitsBehind} {commitsBehind, plural, one {commit} other {commits}} behind',
});

interface VersionStatusProps {
  onClick?: () => void;
}

const VersionStatus = ({ onClick }: VersionStatusProps) => {
  const intl = useIntl();
  const { data } = useSWR<StatusResponse>('/api/v1/status', {
    refreshInterval: 60 * 1000,
  });

  if (!data) {
    return null;
  }

  const versionStream =
    data.commitTag === 'local'
      ? 'Keep it up! 👍'
      : data.version.startsWith('development-')
      ? intl.formatMessage(messages.streamdevelop)
      : intl.formatMessage(messages.streamstable);

  return (
    <Link
      href="/settings/about"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onClick) {
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      className={`mx-2 flex items-center rounded-lg p-2 text-xs transition duration-300 ${
        data.updateAvailable
          ? 'plex-border-primary plex-bg-primary rounded-md bg-opacity-50 text-gray-100 backdrop-blur'
          : 'plex-bg-secondary hover:plex-bg-primary text-gray-300 ring-1 ring-gray-700'
      }`}
    >
      {data.commitTag === 'local' ? (
        <CodeBracketIcon className="h-6 w-6" />
      ) : data.version.startsWith('development-') ? (
        <BeakerIcon className="h-6 w-6" />
      ) : (
        <ServerIcon className="h-6 w-6" />
      )}
      <div className="flex min-w-0 flex-1 flex-col truncate px-2 last:pr-0">
        <span className="font-bold">{versionStream}</span>
        <span className="truncate">
          {data.commitTag === 'local' ? (
            '(⌐■_■)'
          ) : data.commitsBehind > 0 ? (
            intl.formatMessage(messages.commitsbehind, {
              commitsBehind: data.commitsBehind,
            })
          ) : data.commitsBehind === -1 ? (
            intl.formatMessage(messages.outofdate)
          ) : (
            <code className="bg-transparent p-0">
              {data.version.replace('development-', '')}
            </code>
          )}
        </span>
      </div>
      {data.updateAvailable && <ArrowUpCircleIcon className="h-6 w-6" />}
    </Link>
  );
};

export default VersionStatus;
