import Button from '@app/components/Common/Button';
import PageTitle from '@app/components/Common/PageTitle';
import SettingsApplicationName from '@app/components/Settings/SettingsGeneral';
import SettingsPlex from '@app/components/Settings/SettingsPlex';
import LoginWithPlex from '@app/components/Setup/LoginWithPlex';
import SetupSteps from '@app/components/Setup/SetupSteps';
import useLocale from '@app/hooks/useLocale';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { mutate } from 'swr';

const messages = defineMessages({
  setup: 'Setup',
  finish: 'Finish Setup',
  finishing: 'Finishing…',
  continue: 'Continue',
  loginwithplex: 'Sign in with Plex',
  configureplex: 'Configure Plex',
  configurename: 'Configure Application Name',
  tip: 'Tip',
});

const SetupContent = () => {
  const intl = useIntl();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [plexSettingsComplete, setPlexSettingsComplete] = useState(false);
  const [titleComplete, setTitleComplete] = useState(false);
  const router = useRouter();
  const { locale } = useLocale();

  const finishSetup = async () => {
    setIsUpdating(true);
    const response = await axios.post<{ initialized: boolean }>(
      '/api/v1/settings/initialize'
    );

    setIsUpdating(false);
    if (response.data.initialized) {
      await axios.post('/api/v1/settings/main', { locale });
      mutate('/api/v1/settings/public');

      router.push('/');
    }
  };

  return (
    <div>
      <PageTitle title={intl.formatMessage(messages.setup)} />
      <div className="relative z-40 px-4 sm:mx-auto sm:w-full sm:max-w-4xl">
        <nav className="relative z-50">
          <ul className="plex-border-primary divide-y divide-gray-600/50 overflow-hidden rounded-lg border border-gray-600/50 bg-zinc-800/60 shadow-lg backdrop-blur-md md:flex md:divide-y-0">
            <SetupSteps
              stepNumber={1}
              description={intl.formatMessage(messages.loginwithplex)}
              active={currentStep === 1}
              completed={currentStep > 1}
            />
            <SetupSteps
              stepNumber={2}
              description={intl.formatMessage(messages.configureplex)}
              active={currentStep === 2}
              completed={currentStep > 2}
            />
            <SetupSteps
              stepNumber={3}
              description={intl.formatMessage(messages.configurename)}
              active={currentStep === 3}
              completed={currentStep > 3}
              isLastStep={true}
            />
          </ul>
        </nav>
        <div className="mt-10 w-full p-6 text-white">
          {currentStep === 1 && (
            <LoginWithPlex onComplete={() => setCurrentStep(2)} />
          )}
          {currentStep === 2 && (
            <div>
              <SettingsPlex onComplete={() => setPlexSettingsComplete(true)} />
              <div className="actions">
                <div className="flex justify-end">
                  <span className="ml-3 inline-flex rounded-md shadow-sm">
                    <Button
                      buttonType="primary"
                      disabled={!plexSettingsComplete}
                      onClick={() => setCurrentStep(3)}
                    >
                      {intl.formatMessage(messages.continue)}
                    </Button>
                  </span>
                </div>
              </div>
            </div>
          )}
          {currentStep === 3 && (
            <div>
              <SettingsApplicationName
                onComplete={() => setTitleComplete(true)}
              />
              <div className="actions">
                <div className="flex justify-end">
                  <span className="ml-3 inline-flex rounded-md shadow-sm">
                    <Button
                      buttonType="primary"
                      disabled={!titleComplete}
                      onClick={() => finishSetup()}
                    >
                      {isUpdating
                        ? intl.formatMessage(messages.finishing)
                        : intl.formatMessage(messages.finish)}
                    </Button>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupContent;
