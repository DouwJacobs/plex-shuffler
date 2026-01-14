import { useUser } from '@app/hooks/useUser';
import { Menu, Transition } from '@headlessui/react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { CogIcon, UserIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import Link from 'next/link';
import { Fragment } from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  myprofile: 'Profile',
  settings: 'Settings',
  signout: 'Sign Out',
});

const UserDropdown = () => {
  const { user, revalidate } = useUser();
  const intl = useIntl();

  const logout = async () => {
    const response = await axios.post('/api/v1/auth/logout');

    if (response.data?.status === 'ok') {
      revalidate();
    }
  };

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button
          className="flex max-w-xs items-center rounded-full text-sm shadow-lg ring-2 ring-gray-600/50 transition-all duration-200 hover:shadow-xl hover:ring-gray-500/80 focus:outline-none focus:ring-2 focus:ring-plex-primary/50"
          data-testid="user-menu"
        >
          <img
            className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-700/50 transition-all duration-200 hover:ring-gray-500/80 sm:h-10 sm:w-10"
            src={user?.avatar}
            alt=""
          />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
        appear
      >
        <Menu.Items className="absolute right-0 mt-3 w-72 origin-top-right rounded-lg shadow-2xl">
          <div className="divide-y divide-gray-700/50 overflow-hidden rounded-lg bg-zinc-800/95 ring-1 ring-gray-600/50 backdrop-blur-md">
            <div className="flex flex-col space-y-4 px-5 py-5">
              <div className="flex items-center space-x-3">
                <img
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-600/50 sm:h-12 sm:w-12"
                  src={user?.avatar}
                  alt=""
                />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-lg font-semibold text-gray-100">
                    {user?.displayName}
                  </span>
                  <span className="truncate text-sm text-gray-400">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-2">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href={`/profile`}
                    className={`flex items-center rounded-lg px-5 py-3 text-base font-medium text-gray-200 transition-all duration-200 ease-in-out ${
                      active
                        ? 'bg-zinc-700/80 text-white shadow-md'
                        : 'hover:bg-zinc-700/50'
                    }`}
                    data-testid="user-menu-profile"
                  >
                    <UserIcon className="mr-3 inline h-6 w-6" />
                    <span>{intl.formatMessage(messages.myprofile)}</span>
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href={`/profile/settings/main`}
                    className={`flex items-center rounded-lg px-5 py-3 text-base font-medium text-gray-200 transition-all duration-200 ease-in-out ${
                      active
                        ? 'bg-zinc-700/80 text-white shadow-md'
                        : 'hover:bg-zinc-700/50'
                    }`}
                    data-testid="user-menu-settings"
                  >
                    <CogIcon className="mr-3 inline h-6 w-6" />
                    <span>{intl.formatMessage(messages.settings)}</span>
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={`flex items-center rounded-lg px-5 py-3 text-base font-medium text-gray-200 transition-all duration-200 ease-in-out ${
                      active
                        ? 'bg-red-600/80 text-white shadow-md'
                        : 'hover:bg-red-600/50'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                    }}
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 inline h-6 w-6" />
                    <span>{intl.formatMessage(messages.signout)}</span>
                  </a>
                )}
              </Menu.Item>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserDropdown;
