import LogoIcon from '@app/assets/images/plex_shuffle_icon.png';
import SideNavigation from '@app/components/Layout/SideNavigation';
import TopNavigation from '@app/components/Layout/TopNavigation';
import type { AvailableLocale } from '@app/context/LanguageContext';
import useLocale from '@app/hooks/useLocale';
import useSettings from '@app/hooks/useSettings';
import { useUser } from '@app/hooks/useUser';
import { Bars3BottomLeftIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MobileMenu from './MobileMenu';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const { setLocale } = useLocale();
  const { currentSettings } = useSettings();

  useEffect(() => {
    if (setLocale && user) {
      setLocale(
        (user?.settings?.locale
          ? user.settings.locale
          : currentSettings.locale) as AvailableLocale
      );
    }
  }, [setLocale, currentSettings.locale, user]);

  useEffect(() => {
    const updateScrolled = () => {
      if (window.pageYOffset > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', updateScrolled, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScrolled);
    };
  }, []);

  return (
    <div className="flex h-full min-h-full min-w-0">
      <div className="pwa-only fixed inset-0 z-20 h-1 w-full border-gray-700 md:border-t" />
      <div className="absolute top-0 h-64 w-full ">
        <div className="relative inset-0 h-full w-full" />
      </div>
      <SideNavigation
        open={isSidebarOpen}
        setClosed={() => setSidebarOpen(false)}
      />
      <div className="sm:hidden">
        <MobileMenu />
      </div>

      <div className="relative mb-16 flex w-0 min-w-0 flex-1 flex-col lg:ml-64">
        <div
          className={`topbar fixed left-0 right-0 top-0 z-10 flex flex-shrink-0 bg-opacity-80 transition duration-300`}
        >
          <div className="flex flex-1 items-center justify-between">
            <TopNavigation>
              <button
                className={`mr-2 hidden text-white sm:block ${
                  isScrolled ? 'opacity-90' : 'opacity-70'
                } transition duration-300 focus:outline-none lg:hidden`}
                aria-label="Open sidebar"
                onClick={() => setSidebarOpen(true)}
                data-testid="sidebar-toggle"
              >
                <Bars3BottomLeftIcon className="h-7 w-7" />
              </button>
              <button
                className={`mr-2 text-white ${
                  isScrolled ? 'opacity-90' : 'opacity-70'
                } pwa-only transition duration-300 hover:text-white focus:text-white focus:outline-none`}
                onClick={() => router.back()}
              ></button>
              <div className="flex-shrink-0 items-center md:hidden lg:hidden">
                <span className="px-4">
                  <Link href="/">
                    <img
                      src={LogoIcon.src}
                      alt="Logo"
                      className="h-8 lg:hidden"
                    />
                  </Link>
                </span>
              </div>
            </TopNavigation>
          </div>
        </div>

        <main className="relative top-16 z-0 focus:outline-none" tabIndex={0}>
          <div className="mb-6">
            <div className="max-w-8xl mx-auto content-center px-2 lg:pl-8 lg:pr-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
