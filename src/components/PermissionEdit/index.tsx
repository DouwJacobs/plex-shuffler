import type { PermissionItem } from '@app/components/PermissionOption';
import PermissionOption from '@app/components/PermissionOption';
import type { User } from '@app/hooks/useUser';
import { Permission } from '@app/hooks/useUser';
import { defineMessages, useIntl } from 'react-intl';

export const messages = defineMessages({
  admin: 'Admin',
  adminDescription:
    'Full administrator access. Bypasses all other permission checks.',
  users: 'Manage Users',
  usersDescription:
    'Grant permission to manage users. Users with this permission cannot modify users with or grant the Admin privilege.',
});

interface PermissionEditProps {
  actingUser?: User;
  currentUser?: User;
  currentPermission: number;
  onUpdate: (newPermissions: number) => void;
}

export const PermissionEdit = ({
  actingUser,
  currentUser,
  currentPermission,
  onUpdate,
}: PermissionEditProps) => {
  const intl = useIntl();

  const permissionList: PermissionItem[] = [
    {
      id: 'admin',
      name: intl.formatMessage(messages.admin),
      description: intl.formatMessage(messages.adminDescription),
      permission: Permission.ADMIN,
    },
    {
      id: 'users',
      name: intl.formatMessage(messages.users),
      description: intl.formatMessage(messages.usersDescription),
      permission: Permission.MANAGE_USERS,
    },
  ];

  return (
    <>
      {permissionList.map((permissionItem) => (
        <PermissionOption
          key={`permission-option-${permissionItem.id}`}
          option={permissionItem}
          actingUser={actingUser}
          currentUser={currentUser}
          currentPermission={currentPermission}
          onUpdate={(newPermission) => onUpdate(newPermission)}
        />
      ))}
    </>
  );
};

export default PermissionEdit;