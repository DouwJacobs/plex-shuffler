import SettingsApplicationName from '@app/components/Settings/SettingsApplicationName';
import SettingsLayout from '@app/components/Settings/SettingsLayout';
import useRouteGuard from '@app/hooks/useRouteGuard';
import { Permission } from '@app/hooks/useUser';
import type { NextPage } from 'next';

const SettingsMain: NextPage = () => {
  useRouteGuard(Permission.ADMIN);
  return (
    <SettingsLayout>
      <SettingsApplicationName />
    </SettingsLayout>
  );
};

export default SettingsMain;
