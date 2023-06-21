import React from "react";
import PageTitle from "@app/components/Common/PageTitle";
import PlexLoginButton from "@app/components/PlexLoginButton";
import Card from "@app/components/Common/Card";
import Logo from "@app/components/Common/Logo";
import useSettings from "@app/hooks/useSettings";
import { useUser } from "@app/hooks/useUser";
import axios from "axios";
import { useRouter } from "next/dist/client/router";
import { useEffect, useState } from "react";
import { defineMessages, useIntl } from 'react-intl';
import LanguagePicker from '@app/components/Layout/LanguagePicker';
import toast from "react-hot-toast";

import styles from "./Login.module.css";

const messages = defineMessages({
  signin: "Sign In",
  signinheader: "Sign in to continue",
  signinwithplex: "Use your Plex account",
  siginingloading: "Login Loading...",
  signinsuccessful: "Login Successful!"
});

const Login = () => {
  const intl = useIntl();
  const [isProcessing, setProcessing] = useState(false);
  const [authToken, setAuthToken] = useState<string | undefined>(undefined);
  const { user, revalidate } = useUser();
  const router = useRouter();

  // Effect that is triggered when the `authToken` comes back from the Plex OAuth
  // We take the token and attempt to sign in. If we get a success message, we will
  // ask swr to revalidate the user which _should_ come back with a valid user.
  useEffect(() => {
    const login = async () => {
      let toastId;
      setProcessing(true);
      try {
        toastId = toast.loading(intl.formatMessage(messages.siginingloading));
        const response = await axios.post("/api/v1/auth/plex", { authToken });

        if (response.data?.id) {
          revalidate();
          if (toastId) {
            toast.remove(toastId);
          }

          toast.success(intl.formatMessage(messages.signinsuccessful));
        }

        
      } catch (e) {
        if (toastId) {
          toast.remove(toastId);
        }
        toast.error(e.response.data.message);
        setAuthToken(undefined);
        setProcessing(false);
      }
    };
    if (authToken) {
      login();
    }
  }, [authToken, revalidate]);

  // Effect that is triggered whenever `useUser`'s user changes. If we get a new
  // valid user, we redirect the user to the home page as the login was successful.
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <React.Fragment>
      <PageTitle title={intl.formatMessage(messages.signin)} />
      <Logo />
      <div className="absolute top-4 right-4 z-50">
        <LanguagePicker />
      </div>
      <Card className={styles["login-card"]}>
        <div className={styles["login-content"]}>
          <h2>{intl.formatMessage(messages.signinheader)}</h2>
          <PlexLoginButton
            onAuthToken={(authToken) => setAuthToken(authToken)}
          />
        </div>
      </Card>
    </React.Fragment>
  );
};

export default Login;
