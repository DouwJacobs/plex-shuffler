// import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import globalMessages from '@app/i18n/globalMessages';
import PlexOAuth from '@app/utils/plex';
import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import styles from './PlexLoginButton.module.css';

const messages = defineMessages({
  signinwithplex: 'Sign in with Plex',
  signingin: 'Signing In…',
});

const plexOAuth = new PlexOAuth();

interface PlexLoginButtonProps {
  onAuthToken: (authToken: string) => void;
  isProcessing?: boolean;
  onError?: (message: string) => void;
}

const PlexLoginButton = ({
  onAuthToken,
  onError,
  isProcessing,
}: PlexLoginButtonProps) => {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);

  const getPlexLogin = async () => {
    setLoading(true);
    try {
      const authToken = await plexOAuth.login();
      setLoading(false);
      onAuthToken(authToken);
    } catch (e) {
      if (onError) {
        onError(e.message);
      }
      setLoading(false);
    }
  };

  return (
    <span className={styles['plex-button-shell']}>
      <button
        type="button"
        className={styles['plex-button']}
        onClick={() => {
          plexOAuth.preparePopup();
          setTimeout(() => getPlexLogin(), 1500);
        }}
        disabled={loading}
      >
        <div className={styles['button-text']}>
          <span className={styles['plex-login-text']}>
            {loading
              ? intl.formatMessage(globalMessages.loading)
              : isProcessing
              ? intl.formatMessage(messages.signingin)
              : intl.formatMessage(messages.signinwithplex)}
          </span>
        </div>
      </button>
    </span>
  );
};

export default PlexLoginButton;
