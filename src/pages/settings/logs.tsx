import SettingsLayout from '@app/components/Settings/SettingsLayout';
import useRouteGuard from '@app/hooks/useRouteGuard';
import { Permission } from '@app/hooks/useUser';
import type { NextPage } from 'next';
import SettingsLogs from '@app/components/Settings/SettingsLogs';

const SettingsLogsPage: NextPage = () => {
  useRouteGuard(Permission.ADMIN);
  return (
    <SettingsLayout>
        <SettingsLogs />
    </SettingsLayout>
  );
};

export default SettingsLogsPage;