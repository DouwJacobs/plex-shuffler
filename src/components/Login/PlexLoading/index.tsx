import Spinner from "@app/components/Common/LoadingSpinner";
import Card from "@app/components/Common/Card";
import styles from "./LoginLoading.module.css";
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
    loadingLogin: "Please wait while you are being redirected to the Plex login page."
});

const PlexLoading = () => {
  const intl = useIntl();
  return (
    <Card className={styles["login-card"]}>
      <div className={styles["login-content"]}>
        <h2>{intl.formatMessage(messages.loadingLogin)}</h2>
        <Spinner />
      </div>
    </Card>
  );
};

export default PlexLoading;