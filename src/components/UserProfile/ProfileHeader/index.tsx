import Button from '@app/components/Common/Button';
import type { User } from '@app/hooks/useUser';
import { Permission, useUser } from '@app/hooks/useUser';
import { CogIcon, UserIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { Fragment } from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  settings: 'Edit Settings',
  profile: 'View Profile',
  joindate: 'Joined {joindate}',
  userid: 'User ID: {userid}',
});

interface ProfileHeaderProps {
  user: User;
  isSettingsPage?: boolean;
}

const ProfileHeader = ({ user, isSettingsPage }: ProfileHeaderProps) => {
  const intl = useIntl();
  const { user: loggedInUser, hasPermission } = useUser();

  const subtextItems: React.ReactNode[] = [
    intl.formatMessage(messages.joindate, {
      joindate: intl.formatDate(user.createdAt, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    }),
  ];

  return (
    <div className="relative z-40 mb-12 mt-6 lg:flex lg:items-end lg:justify-between lg:space-x-5">
      <div className="flex items-end justify-items-end space-x-5">
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              className="h-28 w-28 rounded-full bg-gray-600 object-cover shadow-lg ring-2 ring-gray-600/50"
              src={user.avatar}
              alt=""
            />
            <span
              className="absolute inset-0 rounded-full shadow-inner"
              aria-hidden="true"
            ></span>
          </div>
        </div>
        <div className="pt-1.5">
          <h1 className="mb-2 flex flex-col sm:flex-row sm:items-center">
            <Link
              href={
                user.id === loggedInUser?.id ? '/profile' : `/users/${user.id}`
              }
              className="plex-color-primary text-xl font-bold transition-colors duration-200 hover:text-plex-primary/80 sm:text-3xl"
            >
              {user.displayName}
            </Link>
            {user.email && user.displayName.toLowerCase() !== user.email && (
              <span className="text-sm text-gray-400 sm:ml-2 sm:text-lg">
                ({user.email})
              </span>
            )}
          </h1>
          <p className="text-sm font-medium text-gray-400">
            {subtextItems.reduce((prev, curr) => (
              <Fragment>
                {prev} | {curr}
              </Fragment>
            ))}
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse lg:flex-row lg:justify-end lg:space-x-4 lg:space-y-0 lg:space-x-reverse">
        {(loggedInUser?.id === user.id ||
          (user.id !== 1 && hasPermission(Permission.MANAGE_USERS))) &&
        !isSettingsPage ? (
          <Link
            href={
              loggedInUser?.id === user.id
                ? `/profile/settings/main`
                : `/users/${user.id}/settings`
            }
            passHref
          >
            <Button buttonType="primary" buttonSize="lg">
              <CogIcon className="h-6 w-6" />
              <span>{intl.formatMessage(messages.settings)}</span>
            </Button>
          </Link>
        ) : (
          isSettingsPage && (
            <Link
              href={
                loggedInUser?.id === user.id ? `/profile` : `/users/${user.id}`
              }
              passHref
            >
              <Button buttonType="primary" buttonSize="lg">
                <UserIcon className="h-6 w-6" />
                <span>{intl.formatMessage(messages.profile)}</span>
              </Button>
            </Link>
          )
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
