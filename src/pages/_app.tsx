import favicon from '@app/assets/favicon.ico';
import ParticlesTS from '@app/components/Common/ParticlesJS';
import Layout from '@app/components/Layout';
import type { AvailableLocale } from '@app/context/LanguageContext';
import { LanguageContext } from '@app/context/LanguageContext';
import { SettingsProvider } from '@app/context/SettingsContext';
import { UserContext } from '@app/context/UserContext';
import type { User } from '@app/hooks/useUser';
import '@app/styles/globals.css';
import { polyfillIntl } from '@app/utils/polyfillIntl';
import type { PublicSettingsResponse } from '@server/interfaces/api/settingsInterfaces';
import axios from 'axios';
import type { AppInitialProps, AppProps } from 'next/app';
import App from 'next/app';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { IntlProvider } from 'react-intl';
import { SWRConfig } from 'swr';

// Custom types so we can correctly type our GetInitialProps function
// with our combined user prop
// This is specific to _app.tsx. Other pages will not need to do this!
type NextAppComponentType = typeof App;
type MessagesType = Record<string, string>;

interface ExtendedAppProps extends AppProps {
  user: User;
  messages: MessagesType;
  locale: AvailableLocale;
  currentSettings: PublicSettingsResponse;
}

const loadLocaleData = (locale: AvailableLocale): Promise<any> => {
  switch (locale) {
    case 'af':
      return import('../i18n/locale/af.json');
    default:
      return import('../i18n/locale/en.json');
  }
};

const CoreApp: Omit<NextAppComponentType, 'origGetInitialProps'> = ({
  Component,
  pageProps,
  router,
  user,
  messages,
  locale,
  currentSettings,
}: ExtendedAppProps) => {
  let component: React.ReactNode;
  const [loadedMessages, setMessages] = useState<MessagesType>(messages);
  const [currentLocale, setLocale] = useState<AvailableLocale>(locale);

  useEffect(() => {
    loadLocaleData(currentLocale).then(setMessages);
  }, [currentLocale]);

  if (router.pathname.match(/(login|setup)/)) {
    component = <Component {...pageProps} />;
  } else {
    component = (
      <Layout>
        <Component {...pageProps} />
      </Layout>
    );
  }

  return (
    <SWRConfig
      value={{
        fetcher: (url) => axios.get(url).then((res) => res.data),
        fallback: {
          '/api/v1/auth/me': user,
        },
      }}
    >
      <LanguageContext.Provider value={{ locale: currentLocale, setLocale }}>
        <IntlProvider
          locale={currentLocale}
          defaultLocale="en"
          messages={loadedMessages}
        >
          <SettingsProvider currentSettings={currentSettings}>
            <Toaster position="top-right" reverseOrder={true} />
            <ParticlesTS />
            <Head>
              <title>{currentSettings.applicationTitle}</title>
              <link rel="icon" href={favicon.src} sizes="any" />
              <meta
                name="viewport"
                content="initial-scale=1, viewport-fit=cover, width=device-width"
              ></meta>
            </Head>

            <UserContext initialUser={user}>{component}</UserContext>
          </SettingsProvider>
        </IntlProvider>
      </LanguageContext.Provider>
    </SWRConfig>
  );
};

CoreApp.getInitialProps = async (initialProps) => {
  const { ctx, router } = initialProps;
  let user: User | undefined = undefined;
  let currentSettings: PublicSettingsResponse = {
    initialized: false,
    applicationTitle: '',
    applicationUrl: '',
    hideAvailable: false,
    movie4kEnabled: false,
    series4kEnabled: false,
    localLogin: true,
    region: '',
    originalLanguage: '',
    partialRequestsEnabled: true,
    cacheImages: false,
    vapidPublic: '',
    enablePushRegistration: false,
    locale: 'en',
    emailEnabled: false,
    newPlexLogin: true,
  };

  if (ctx.res) {
    // Check if app is initialized and redirect if necessary
    const response = await axios.get<PublicSettingsResponse>(
      `http://0.0.0.0:${process.env.PORT || 3210}/api/v1/settings/public`
    );

    currentSettings = response.data;

    const initialized = response.data.initialized;

    if (!initialized) {
      if (!router.pathname.match(/(setup|login\/plex)/)) {
        ctx.res.writeHead(307, {
          Location: '/setup',
        });
        ctx.res.end();
      }
    } else {
      try {
        // Attempt to get the user by running a request to the local api
        const response = await axios.get<User>(
          `http://0.0.0.0:${process.env.PORT || 3210}/api/v1/auth/me`,
          {
            headers:
              ctx.req && ctx.req.headers.cookie
                ? { cookie: ctx.req.headers.cookie }
                : undefined,
          }
        );
        user = response.data;

        if (router.pathname.match(/(setup|login)/)) {
          ctx.res.writeHead(307, {
            Location: '/',
          });
          ctx.res.end();
        }
      } catch (e) {
        // If there is no user, and ctx.res is set (to check if we are on the server side)
        // _AND_ we are not already on the login or setup route, redirect to /login with a 307
        // before anything actually renders
        if (!router.pathname.match(/(login|setup)/)) {
          const callbackURL = router.asPath;
          ctx.res.writeHead(307, {
            Location: `/login?callbackURL=${callbackURL}`,
          });
          ctx.res.end();
        }
      }
    }
  }

  // Run the default getInitialProps for the main nextjs initialProps
  const appInitialProps: AppInitialProps = await App.getInitialProps(
    initialProps
  );

  const locale = user?.settings?.locale
    ? user.settings.locale
    : currentSettings.locale;

  const messages = await loadLocaleData(locale as AvailableLocale);
  await polyfillIntl(locale);

  return { ...appInitialProps, user, messages, locale, currentSettings };
};

export default CoreApp;
