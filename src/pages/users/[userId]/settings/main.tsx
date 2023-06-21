import UserSettings from '@app/components/UserProfile/UserSettings';
import UserGeneralSettings from '@app/components/UserProfile/UserSettings/UserGeneralSettings';
import type { NextPage } from 'next';
import useRouteGuard from '@app/hooks/useRouteGuard';
import { Permission } from '@app/hooks/useUser';

const UserSettingsPage: NextPage = () => {
  useRouteGuard(Permission.MANAGE_USERS);
  return (
    <UserSettings>
      <UserGeneralSettings />
    </UserSettings>
  );
};

export default UserSettingsPage;