import Badge from '@app/components/Common/Badge';
import Button from '@app/components/Common/Button';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import PageTitle from '@app/components/Common/PageTitle';
import type { AvailableLocale } from '@app/context/LanguageContext';
import { availableLanguages } from '@app/context/LanguageContext';
import useLocale from '@app/hooks/useLocale';
import useSettings from '@app/hooks/useSettings';
import { Permission, useUser } from '@app/hooks/useUser';
import Error from '@app/pages/_error';
import { ArrowDownOnSquareIcon } from '@heroicons/react/24/outline';
import type { UserSettingsGeneralResponse } from '@server/interfaces/api/userSettingsInterfaces';
import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import * as Yup from 'yup';

const messages = defineMessages({
  general: 'General',
  generalsettings: 'General Settings',
  displayName: 'Display Name',
  accounttype: 'Account Type',
  plexuser: 'Plex User',
  localuser: 'Local User',
  role: 'Role',
  owner: 'Owner',
  admin: 'Admin',
  user: 'User',
  toastSettingsSuccess: 'Settings saved successfully!',
  toastSettingsFailure: 'Something went wrong while saving settings.',
  applanguage: 'Display Language',
  languageDefault: 'Default ({language})',
  saving: 'Saving...',
  save: 'Save Changes',
  usersettings: 'User Settings',
});

const UserGeneralSettings = () => {
  const intl = useIntl();
  const { locale, setLocale } = useLocale();
  const router = useRouter();
  const {
    user,
    hasPermission,
    revalidate: revalidateUser,
  } = useUser({
    id: Number(router.query.userId),
  });
  const { user: currentUser } = useUser();
  const { currentSettings } = useSettings();
  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<UserSettingsGeneralResponse>(
    user ? `/api/v1/user/${user?.id}/settings/main` : null
  );

  const UserGeneralSettingsSchema = Yup.object().shape({});

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <Error statusCode={500} />;
  }

  return (
    <>
      <PageTitle
        title={[
          intl.formatMessage(messages.general),
          intl.formatMessage(messages.usersettings),
        ]}
      />
      <div className="mb-6">
        <h3 className="heading">
          {intl.formatMessage(messages.generalsettings)}
        </h3>
      </div>
      <Formik
        initialValues={{
          displayName: data?.username,
          locale: data?.locale,
        }}
        validationSchema={UserGeneralSettingsSchema}
        enableReinitialize
        onSubmit={async (values) => {
          try {
            await axios.post(`/api/v1/user/${user?.id}/settings/main`, {
              username: values.displayName,
              locale: values.locale,
            });

            if (currentUser?.id === user?.id && setLocale) {
              setLocale(
                (values.locale
                  ? values.locale
                  : currentSettings.locale) as AvailableLocale
              );
            }

            toast.success(intl.formatMessage(messages.toastSettingsSuccess));
          } catch (e) {
            toast.error(intl.formatMessage(messages.toastSettingsFailure));
          } finally {
            revalidate();
            revalidateUser();
          }
        }}
      >
        {({ errors, touched, isSubmitting, isValid }) => {
          return (
            <Form className="section">
              <div className="form-row">
                <label className="text-label">
                  {intl.formatMessage(messages.accounttype)}
                </label>
                <div className="mb-1 text-sm font-medium leading-5 text-white sm:mt-2">
                  <div className="flex max-w-lg items-center">
                    <Badge badgeType="warning">
                      {intl.formatMessage(messages.plexuser)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <label className="text-label">
                  {intl.formatMessage(messages.role)}
                </label>
                <div className="plex-color-primary mb-1 text-sm font-medium leading-5 sm:mt-2">
                  <div className="flex max-w-lg items-center">
                    {user?.id === 1
                      ? intl.formatMessage(messages.owner)
                      : hasPermission(Permission.ADMIN)
                      ? intl.formatMessage(messages.admin)
                      : intl.formatMessage(messages.user)}
                  </div>
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="displayName" className="text-label">
                  {intl.formatMessage(messages.displayName)}
                </label>
                <div className="form-input-area">
                  <div className="form-input-field text-white">
                    <Field
                      id="displayName"
                      name="displayName"
                      type="text"
                      placeholder={
                        user?.plexUsername ? user.plexUsername : user?.email
                      }
                    />
                  </div>
                  {errors.displayName &&
                    touched.displayName &&
                    typeof errors.displayName === 'string' && (
                      <div className="error">{errors.displayName}</div>
                    )}
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="locale" className="text-label">
                  {intl.formatMessage(messages.applanguage)}
                </label>
                <div className="form-input-area">
                  <div className="form-input-field">
                    <Field as="select" id="locale" name="locale">
                      <option value="" lang={locale}>
                        {intl.formatMessage(messages.languageDefault, {
                          language:
                            availableLanguages[currentSettings.locale].display,
                        })}
                      </option>
                      {(
                        Object.keys(
                          availableLanguages
                        ) as (keyof typeof availableLanguages)[]
                      ).map((key) => (
                        <option
                          key={key}
                          value={availableLanguages[key].code}
                          lang={availableLanguages[key].code}
                        >
                          {availableLanguages[key].display}
                        </option>
                      ))}
                    </Field>
                  </div>
                </div>
              </div>

              <div className="actions">
                <div className="flex justify-end">
                  <span className="ml-3 inline-flex rounded-md shadow-sm">
                    <Button
                      buttonType="primary"
                      type="submit"
                      disabled={isSubmitting || !isValid}
                    >
                      <ArrowDownOnSquareIcon />
                      <span>
                        {isSubmitting
                          ? intl.formatMessage(messages.saving)
                          : intl.formatMessage(messages.save)}
                      </span>
                    </Button>
                  </span>
                </div>
              </div>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};

export default UserGeneralSettings;
