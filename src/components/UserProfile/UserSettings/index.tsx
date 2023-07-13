import Alert from '@app/components/Common/Alert';
import Card from '@app/components/Common/Card';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import PageTitle from '@app/components/Common/PageTitle';
import type { SettingsRoute } from '@app/components/Common/SettingsTabs';
import SettingsTabs from '@app/components/Common/SettingsTabs';
import ProfileHeader from '@app/components/UserProfile/ProfileHeader';
import { useUser } from '@app/hooks/useUser';
import globalMessages from '@app/i18n/globalMessages';
import Error from '@app/pages/_error';
import { Permission } from '@server/lib/permissions';
import { useRouter } from 'next/router';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  menuGeneralSettings: 'General',
  menuPermissions: 'Permissions',
  unauthorizedDescription:
    "You do not have permission to modify this user's settings.",
  usersettings: 'User Settings',
  menuPlaylistSettings: 'Playlists',
});

type UserSettingsProps = {
  children: React.ReactNode;
};

const UserSettings = ({ children }: UserSettingsProps) => {
  const router = useRouter();
  const { user: currentUser } = useUser();
  const { user, error } = useUser({ id: Number(router.query.userId) });
  const intl = useIntl();

  if (!user && !error) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Error statusCode={500} />;
  }

  const settingsRoutes: SettingsRoute[] = [
    {
      text: intl.formatMessage(messages.menuGeneralSettings),
      route: '/settings/main',
      regex: /\/settings(\/main)?$/,
    },
    {
      text: intl.formatMessage(messages.menuPlaylistSettings),
      route: '/settings/playlists',
      regex: /\/settings\/playlists/,
    },
    {
      text: intl.formatMessage(messages.menuPermissions),
      route: '/settings/permissions',
      regex: /\/settings\/permissions/,
      requiredPermission: Permission.MANAGE_USERS,
      hidden: currentUser?.id !== 1 && currentUser?.id === user.id,
    },
  ];

  if (currentUser?.id !== 1 && user.id === 1) {
    return (
      <Card className="m-1 p-6 sm:m-1">
        <PageTitle
          title={[intl.formatMessage(messages.usersettings), user.displayName]}
        />
        <ProfileHeader user={user} isSettingsPage />
        <div className="mt-6">
          <Alert
            title={intl.formatMessage(messages.unauthorizedDescription)}
            type="error"
          />
        </div>
      </Card>
    );
  }

  settingsRoutes.forEach((settingsRoute) => {
    settingsRoute.route = router.asPath.includes('/profile')
      ? `/profile${settingsRoute.route}`
      : `/users/${user.id}${settingsRoute.route}`;
  });

  return (
    <Card className="p-6">
      <PageTitle
        title={[
          intl.formatMessage(globalMessages.usersettings),
          user.displayName,
        ]}
      />
      <ProfileHeader user={user} isSettingsPage />
      <div className="mt-6">
        <SettingsTabs settingsRoutes={settingsRoutes} />
      </div>
      <div className="mt-10 text-white">{children}</div>
    </Card>
  );
};

export default UserSettings;
