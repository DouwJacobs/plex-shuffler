import PlexLoginButton from '@app/components/PlexLoginButton';
import { useUser } from '@app/hooks/useUser';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  welcome: 'Welcome to Plex Shuffler',
  signinMessage: 'Get started by signing in with your Plex account',
  siginingloading: 'Login Loading...',
  signinsuccessful: 'Login Successful!',
});

interface LoginWithPlexProps {
  onComplete: () => void;
}

const LoginWithPlex = ({ onComplete }: LoginWithPlexProps) => {
  const intl = useIntl();
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);
  const { user, revalidate } = useUser();

  // Effect that is triggered when the `authToken` comes back from the Plex OAuth
  // We take the token and attempt to login. If we get a success message, we will
  // ask swr to revalidate the user which _shouid_ come back with a valid user.

  useEffect(() => {
    const login = async () => {
      const toastId = toast.loading(
        intl.formatMessage(messages.siginingloading)
      );
      const response = await axios.post('/api/v1/auth/plex', { authToken });

      if (response.data?.id) {
        revalidate();

        if (toastId) {
          toast.remove(toastId);
        }

        toast.success(intl.formatMessage(messages.signinsuccessful));
      }
    };
    if (authToken) {
      login();
    }
  }, [authToken, revalidate]);

  // Effect that is triggered whenever `useUser`'s user changes. If we get a new
  // valid user, we call onComplete which will take us to the next step in Setup.
  useEffect(() => {
    if (user) {
      onComplete();
    }
  }, [user, onComplete]);

  return (
    <form className="flex flex-col items-center">
      <div className="mb-4 flex justify-center text-2xl font-bold text-white">
        {intl.formatMessage(messages.welcome)}
      </div>
      <div className="mb-8 flex justify-center text-base text-gray-300">
        {intl.formatMessage(messages.signinMessage)}
      </div>
      <div className="w-full max-w-xs">
        <PlexLoginButton onAuthToken={(authToken) => setAuthToken(authToken)} />
      </div>
    </form>
  );
};

export default LoginWithPlex;
