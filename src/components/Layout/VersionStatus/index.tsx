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
      className={`mx-2 mb-2 flex items-center rounded-lg px-4 py-3 text-sm transition-all duration-200 ${
        data.updateAvailable
          ? 'plex-border-primary plex-bg-primary border-2 border-plex-primary bg-opacity-80 text-white shadow-lg shadow-plex-primary/30 backdrop-blur-md hover:bg-opacity-90'
          : 'plex-bg-secondary bg-zinc-800/60 text-gray-200 ring-1 ring-gray-600/50 backdrop-blur-sm hover:bg-zinc-700/80 hover:ring-gray-500/50'
      }`}
    >
      {data.commitTag === 'local' ? (
        <CodeBracketIcon className="h-5 w-5 flex-shrink-0" />
      ) : data.version.startsWith('development-') ? (
        <BeakerIcon className="h-5 w-5 flex-shrink-0" />
      ) : (
        <ServerIcon className="h-5 w-5 flex-shrink-0" />
      )}
      <div className="flex min-w-0 flex-1 flex-col truncate px-3 last:pr-0">
        <span className="text-xs font-semibold leading-tight">
          {versionStream}
        </span>
        <span className="truncate text-xs leading-tight">
          {data.commitTag === 'local' ? (
            '(⌐■_■)'
          ) : data.commitsBehind > 0 ? (
            intl.formatMessage(messages.commitsbehind, {
              commitsBehind: data.commitsBehind,
            })
          ) : data.commitsBehind === -1 ? (
            intl.formatMessage(messages.outofdate)
          ) : (
            <code className="bg-transparent p-0 font-mono text-xs">
              {data.version.replace('development-', '')}
            </code>
          )}
        </span>
      </div>
      {data.updateAvailable && (
        <ArrowUpCircleIcon className="ml-1 h-5 w-5 flex-shrink-0" />
      )}
    </Link>
  );
};

export default VersionStatus;
