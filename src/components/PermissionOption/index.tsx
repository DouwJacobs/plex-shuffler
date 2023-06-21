import useSettings from '@app/hooks/useSettings';
import type { User } from '@app/hooks/useUser';
import { Permission } from '@app/hooks/useUser';
import { hasPermission } from '@server/lib/permissions';

export interface PermissionItem {
  id: string;
  name: string;
  description: string;
  permission: Permission;
  children?: PermissionItem[];
  requires?: PermissionRequirement[];
}

interface PermissionRequirement {
  permissions: Permission[];
  type?: 'and' | 'or';
}

interface PermissionOptionProps {
  option: PermissionItem;
  actingUser?: User;
  currentUser?: User;
  currentPermission: number;
  parent?: PermissionItem;
  onUpdate: (newPermissions: number) => void;
}

const PermissionOption = ({
  option,
  actingUser,
  currentUser,
  currentPermission,
  onUpdate,
  parent,
}: PermissionOptionProps) => {
  const settings = useSettings();


  let disabled = false;
  let checked = hasPermission(option.permission, currentPermission);

  if (
    // Permissions for user ID 1 (Plex server owner) cannot be changed
    (currentUser && currentUser.id === 1) ||
    // Admin permission automatically bypasses/grants all other permissions
    (option.permission !== Permission.ADMIN &&
      hasPermission(Permission.ADMIN, currentPermission)) ||
    // Selecting a parent permission automatically selects all children
    (!!parent?.permission &&
      hasPermission(parent.permission, currentPermission))
  ) {
    disabled = true;
    checked = true;
  }

  if (
    // Only the owner can modify the Admin permission
    actingUser?.id !== 1 &&
    option.permission === Permission.ADMIN
  ) {
    disabled = true;
  }

  if (
    // Some permissions are dependent on others; check requirements are fulfilled
    (option.requires &&
      !option.requires.every((requirement) =>
        hasPermission(requirement.permissions, currentPermission, {
          type: requirement.type ?? 'and',
        })
      )) 
  ) {
    disabled = true;
    checked = false;
  }

  return (
    <>
      <div
        className={`relative mt-4 flex items-start first:mt-0 ${
          disabled ? 'opacity-50' : ''
        }`}
      >
        <div className="flex h-6 items-center">
          <input
            id={option.id}
            name="permissions"
            type="checkbox"
            disabled={disabled}
            onChange={() => {
              onUpdate(
                hasPermission(option.permission, currentPermission)
                  ? currentPermission - option.permission
                  : currentPermission + option.permission
              );
            }}
            checked={checked}
          />
        </div>
        <div className="ml-3 text-sm leading-6">
          <label htmlFor={option.id} className="block">
            <div className="flex flex-col">
              <span className="font-medium text-white">{option.name}</span>
              <span className="font-normal text-white">
                {option.description}
              </span>
            </div>
          </label>
        </div>
      </div>
      {(option.children ?? []).map((child) => (
        <div key={`permission-child-${child.id}`} className="mt-4 pl-10">
          <PermissionOption
            option={child}
            currentPermission={currentPermission}
            onUpdate={(newPermission) => onUpdate(newPermission)}
            parent={option}
          />
        </div>
      ))}
    </>
  );
};

export default PermissionOption;