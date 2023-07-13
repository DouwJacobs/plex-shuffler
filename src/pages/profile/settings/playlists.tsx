import UserSettings from '@app/components/UserProfile/UserSettings';
import UserPlaylistSettings from '@app/components/UserProfile/UserSettings/UserPlaylistSettings';
import type { NextPage } from 'next';

const UserPlaylistSettingsPage: NextPage = () => {
  return (
    <UserSettings>
      <UserPlaylistSettings />
    </UserSettings>
  );
};

export default UserPlaylistSettingsPage;
