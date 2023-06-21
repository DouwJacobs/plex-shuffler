import Alert from '@app/components/Common/Alert';
import Badge from '@app/components/Common/Badge';
import List from '@app/components/Common/List';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import PageTitle from '@app/components/Common/PageTitle';
import Releases from '@app/components/Settings/SettingsAbout/Releases';
import Error from '@app/pages/_error';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import type {
  SettingsAboutResponse,
  StatusResponse,
} from '@server/interfaces/api/settingsInterfaces';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';

const messages = defineMessages({
  settings: 'Settings',
  about: 'About',
  plexshufflerinformation: 'About Plex Shuffler',
  version: 'Version',
  gettingsupport: 'Getting Support',
  githubdiscussions: 'GitHub Discussions',
  timezone: 'Time Zone',
  appDataPath: 'Data Directory',
  supportplexshuffler: 'Support Plex Shuffler',
  helppaycoffee: 'Help Pay for Coffee',
  documentation: 'Documentation',
  preferredmethod: 'Preferred',
  outofdate: 'Out of Date',
  uptodate: 'Up to Date',
  betawarning:
    'This is BETA software. Features may be broken and/or unstable. Please report any issues on GitHub!',
  runningDevelop:
    'You are running the <code>develop</code> branch of Plex Shuffler, which is only recommended for those contributing to development or assisting with bleeding-edge testing.',
});

const SettingsAbout = () => {
  const intl = useIntl();
  const { data, error } = useSWR<SettingsAboutResponse>(
    '/api/v1/settings/about'
  );

  const { data: status } = useSWR<StatusResponse>('/api/v1/status');

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <Error statusCode={500} />;
  }

  return (
    <>
      <PageTitle
        title={[
          intl.formatMessage(messages.about),
          intl.formatMessage(messages.settings),
        ]}
      />
      <div className="plex-border-primary plex-bg-primary mt-6 rounded-md border bg-opacity-50 p-4 backdrop-blur">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="text-white-100 h-5 w-5" />
          </div>
          <div className="ml-3 flex-1 md:flex md:justify-between">
            <p className="text-sm leading-5 text-gray-100">
              {intl.formatMessage(messages.betawarning)}
            </p>
            <p className="mt-3 text-sm leading-5 md:ml-6 md:mt-0">
              <a
                href="http://github.com/DouwJacobs/plex-shuffler"
                className="text-white-100 whitespace-nowrap font-medium transition duration-150 ease-in-out hover:text-white"
                target="_blank"
                rel="noreferrer"
              >
                GitHub &rarr;
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="section">
        <List title={intl.formatMessage(messages.plexshufflerinformation)}>
          {data.version.startsWith('develop-') && (
            <Alert
              title={intl.formatMessage(messages.runningDevelop, {
                code: (msg: React.ReactNode) => (
                  <code className="bg-opacity-50">{msg}</code>
                ),
              })}
            />
          )}
          <List.Item
            title={intl.formatMessage(messages.version)}
            className="flex flex-row items-center truncate"
          >
            <code className="truncate">
              {data.version.replace('develop-', '')}
            </code>
            {status?.commitTag !== 'local' &&
              (status?.updateAvailable ? (
                <a
                  href={
                    data.version.startsWith('develop-')
                      ? `https://github.com/DouwJacobs/plex-shuffler/compare/${status.commitTag}...develop`
                      : 'https://github.com/DouwJacobs/plex-shuffler/releases'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge
                    badgeType="warning"
                    className="ml-2 !cursor-pointer transition hover:bg-yellow-400"
                  >
                    {intl.formatMessage(messages.outofdate)}
                  </Badge>
                </a>
              ) : (
                <a
                  href={
                    data.version.startsWith('develop-')
                      ? 'https://github.com/DouwJacobs/plex-shuffler/commits/develop'
                      : 'https://github.com/DouwJacobs/plex-shuffler/releases'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge
                    badgeType="success"
                    className="ml-2 !cursor-pointer transition hover:bg-green-400"
                  >
                    {intl.formatMessage(messages.uptodate)}
                  </Badge>
                </a>
              ))}
          </List.Item>
          <List.Item title={intl.formatMessage(messages.appDataPath)}>
            <code>{data.appDataPath}</code>
          </List.Item>
          {data.tz && (
            <List.Item title={intl.formatMessage(messages.timezone)}>
              <code>{data.tz}</code>
            </List.Item>
          )}
        </List>
      </div>
      <div className="section">
        <List title={intl.formatMessage(messages.gettingsupport)}>
          <List.Item title={intl.formatMessage(messages.documentation)}>
            <a
              href="https://docs.plex-shuffler.dev"
              target="_blank"
              rel="noreferrer"
              className="plex-color-primary transition duration-300 hover:underline"
            >
              https://docs.plex-shuffler.dev
            </a>
          </List.Item>
          <List.Item title={intl.formatMessage(messages.githubdiscussions)}>
            <a
              href="https://github.com/DouwJacobs/plex-shuffler/discussions"
              target="_blank"
              rel="noreferrer"
              className="plex-color-primary transition duration-300 hover:underline"
            >
              https://github.com/DouwJacobs/plex-shuffler/discussions
            </a>
          </List.Item>
        </List>
      </div>
      <div className="section">
        <List title={intl.formatMessage(messages.supportplexshuffler)}>
          <List.Item
            title={`${intl.formatMessage(messages.helppaycoffee)} ☕️`}
          >
            <a
              href="https://github.com/sponsors/DouwJacobs"
              target="_blank"
              rel="noreferrer"
              className="plex-color-primary transition duration-300 hover:underline"
            >
              https://github.com/sponsors/DouwJacobs
            </a>
            <Badge className="ml-2">
              {intl.formatMessage(messages.preferredmethod)}
            </Badge>
          </List.Item>
          <List.Item title="">
            <a
              href="https://patreon.com/plex-shuffler"
              target="_blank"
              rel="noreferrer"
              className="plex-color-primary transition duration-300 hover:underline"
            >
              https://patreon.com/plex-shuffler
            </a>
          </List.Item>
        </List>
      </div>
      <div className="section">
        <Releases currentVersion={data.version} />
      </div>
    </>
  );
};

export default SettingsAbout;
