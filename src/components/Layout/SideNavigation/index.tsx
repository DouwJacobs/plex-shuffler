import LogoFull from '@app/assets/images/plex_shuffler_logo_long.png';
import VersionStatus from '@app/components/Layout/VersionStatus';
import { Permission, useUser } from '@app/hooks/useUser';
import { Transition } from '@headlessui/react';
import {
  CogIcon,
  FilmIcon,
  HomeIcon,
  QueueListIcon,
  TvIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Fragment, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';

export const menuMessages = defineMessages({
  home: 'Home',
  playlists: 'Playlists',
  users: 'Users',
  settings: 'Settings',
  shows: 'TV Shows',
  match: 'Matchflix',
});

interface SidebarProps {
  open?: boolean;
  setClosed: () => void;
}

interface SidebarLinkProps {
  href: string;
  svgIcon: React.ReactNode;
  messagesKey: keyof typeof menuMessages;
  activeRegExp: RegExp;
  as?: string;
  requiredPermission?: Permission | Permission[];
  permissionType?: 'and' | 'or';
  dataTestId?: string;
}

{
  /* <img src={LogoIcon.src} className="mr-3 h-6 w-6" /> */
}

const SidebarLinks: SidebarLinkProps[] = [
  {
    href: '/',
    messagesKey: 'home',
    svgIcon: <HomeIcon className="plex-color-primary mr-3 h-6 w-6" />,
    activeRegExp: /^\/(home\/?)?$/,
  },
  {
    href: '/match',
    messagesKey: 'match',
    svgIcon: <FilmIcon className="plex-color-primary mr-3 h-6 w-6" />,
    activeRegExp: /^\/match/,
  },
  {
    href: '/user/playlists',
    messagesKey: 'playlists',
    svgIcon: <QueueListIcon className="plex-color-primary mr-3 h-6 w-6" />,
    activeRegExp: /^\/user\/playlists$/,
  },
  {
    href: '/shows',
    messagesKey: 'shows',
    svgIcon: <TvIcon className="plex-color-primary mr-3 h-6 w-6" />,
    activeRegExp: /^\/shows/,
  },
  {
    href: '/users',
    messagesKey: 'users',
    svgIcon: <UsersIcon className="plex-color-primary mr-3 h-6 w-6" />,
    activeRegExp: /^\/users/,
    requiredPermission: Permission.MANAGE_USERS,
    dataTestId: 'sidebar-menu-users',
  },
  {
    href: '/settings',
    messagesKey: 'settings',
    svgIcon: <CogIcon className="plex-color-primary mr-3 h-6 w-6" />,
    activeRegExp: /^\/settings/,
    requiredPermission: Permission.ADMIN,
    dataTestId: 'sidebar-menu-settings',
  },
];

const SideNavigation = ({ open, setClosed }: SidebarProps) => {
  const navRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const intl = useIntl();
  const { hasPermission } = useUser();

  return (
    <>
      <div className="lg:hidden">
        <Transition as={Fragment} show={open}>
          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as="div"
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0">
                <div className="plex-bg-secondary absolute inset-0 opacity-90"></div>
              </div>
            </Transition.Child>
            <Transition.Child
              as="div"
              enter="transition-transform ease-in-out duration-300"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition-transform ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <>
                <div className="plex-bg-transparent relative flex h-full w-full max-w-xs flex-1 flex-col">
                  <div className="sidebar-close-button absolute right-0 -mr-14 p-1">
                    <button
                      className="-z-30 flex h-12 w-12 items-center justify-center rounded-full focus:bg-gray-600 focus:outline-none"
                      aria-label="Close sidebar"
                      onClick={() => setClosed()}
                    >
                      <XMarkIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                  <div
                    ref={navRef}
                    className="flex flex-1 flex-col overflow-y-auto pb-8 pt-8 sm:pb-4"
                  >
                    <div className="flex flex-shrink-0 items-center">
                      <span className="px-4 text-2xl text-gray-50">
                        <Link href="/">
                          <img src={LogoFull.src} alt="Logo" />
                        </Link>
                      </span>
                    </div>
                    <nav className="mt-16 flex-1 space-y-4 px-4">
                      {SidebarLinks.filter((link) =>
                        link.requiredPermission
                          ? hasPermission(link.requiredPermission, {
                              type: link.permissionType ?? 'and',
                            })
                          : true
                      ).map((sidebarLink) => {
                        return (
                          <Link
                            key={`mobile-${sidebarLink.messagesKey}`}
                            href={sidebarLink.href}
                            as={sidebarLink.as}
                            onClick={() => setClosed()}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setClosed();
                              }
                            }}
                            role="button"
                            tabIndex={0}
                            className={`flex items-center rounded-md px-2 py-2 text-base font-medium leading-6 text-white transition duration-150 ease-in-out focus:outline-none
                                ${
                                  router.pathname.match(
                                    sidebarLink.activeRegExp
                                  )
                                    ? 'plex-bg-secondary'
                                    : 'hover:plex-bg-transparent-10 focus:bg-gray-700'
                                }
                              `}
                            data-testid={`${sidebarLink.dataTestId}-mobile`}
                          >
                            {sidebarLink.svgIcon}
                            {intl.formatMessage(
                              menuMessages[sidebarLink.messagesKey]
                            )}
                          </Link>
                        );
                      })}
                    </nav>
                    {hasPermission(Permission.ADMIN) && (
                      <div className="px-2">
                        <VersionStatus onClick={() => setClosed()} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-14 flex-shrink-0">
                  {/* <!-- Force sidebar to shrink to fit close icon --> */}
                </div>
              </>
            </Transition.Child>
          </div>
        </Transition>
      </div>

      <div className="fixed bottom-0 left-0 top-0 z-30 hidden lg:flex lg:flex-shrink-0">
        <div className="sidebar flex w-64 flex-col">
          <div className="flex h-0 flex-1 flex-col">
            <div className="flex flex-1 flex-col overflow-y-auto pb-4 pt-8">
              <div className="flex flex-shrink-0 items-center">
                <span className="px-4 text-2xl text-gray-50">
                  <Link href="/">
                    <img src={LogoFull.src} alt="Logo" />
                  </Link>
                </span>
              </div>
              <nav className="mt-16 flex-1 space-y-4 px-4">
                {SidebarLinks.filter((link) =>
                  link.requiredPermission
                    ? hasPermission(link.requiredPermission, {
                        type: link.permissionType ?? 'and',
                      })
                    : true
                ).map((sidebarLink) => {
                  return (
                    <Link
                      key={`desktop-${sidebarLink.messagesKey}`}
                      href={sidebarLink.href}
                      as={sidebarLink.as}
                      className={`group flex items-center rounded-md px-2 py-2 text-lg font-medium leading-6 text-white transition duration-150 ease-in-out focus:outline-none
                                ${
                                  router.pathname.match(
                                    sidebarLink.activeRegExp
                                  )
                                    ? 'bg-zinc-700'
                                    : 'hover:bg-zinc-500 focus:bg-zinc-500'
                                }
                              `}
                      data-testid={sidebarLink.dataTestId}
                    >
                      {sidebarLink.svgIcon}
                      {intl.formatMessage(
                        menuMessages[sidebarLink.messagesKey]
                      )}
                    </Link>
                  );
                })}
              </nav>
              {hasPermission(Permission.ADMIN) && (
                <div className="px-2">
                  <VersionStatus />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideNavigation;
