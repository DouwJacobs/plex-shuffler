import Button from '@app/components/Common/Button';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import PageTitle from '@app/components/Common/PageTitle';
import { useUser } from '@app/hooks/useUser';
import Error from '@app/pages/_error';
import { ArrowDownOnSquareIcon } from '@heroicons/react/24/outline';
import type { PlexLibrary } from '@server/interfaces/api/plexInterfaces';
import type { UserSettingsGeneralResponse } from '@server/interfaces/api/userSettingsInterfaces';
import axios from 'axios';
import { Field, Formik } from 'formik';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import * as Yup from 'yup';

const messages = defineMessages({
  playlists: 'Playlists',
  usersettings: 'User Settings',
  playlistssettings: 'Playlists Settings',
  toastSettingsSuccess: 'Settings saved successfully!',
  toastSettingsFailure: 'Something went wrong while saving settings.',
  saving: 'Saving...',
  save: 'Save Changes',
  appendtotitlelabel: 'Append Plex Shuffler to playlist titles',
  appendtosummarylabel: 'Append Plex Shuffler to playlist summary',
  userDefaultShowLibrary: 'User Default TV Show Library',
});

const UserPlaylistSettings = () => {
  const intl = useIntl();
  const router = useRouter();
  const { user, revalidate: revalidateUser } = useUser({
    id: Number(router.query.userId),
  });
  const { data: plexTVLibraries } = useSWR<PlexLibrary[]>(
    '/api/v1/tv/libraries'
  );

  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<UserSettingsGeneralResponse>(
    user ? `/api/v1/user/${user?.id}/settings/playlists` : null
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
          intl.formatMessage(messages.playlists),
          intl.formatMessage(messages.usersettings),
        ]}
      />
      <div className="mb-6">
        <h3 className="heading">
          {intl.formatMessage(messages.playlistssettings)}
        </h3>
      </div>
      <Formik
        initialValues={{
          appendToTitle: data?.appendToTitle,
          appendToSummary: data?.appendToSummary,
          userDefaultShowLibraryID: data?.userDefaultShowLibraryID,
        }}
        validationSchema={UserGeneralSettingsSchema}
        enableReinitialize
        onSubmit={async (values) => {
          try {
            await axios.post(`/api/v1/user/${user?.id}/settings/playlists`, {
              appendToTitle: values.appendToTitle,
              appendToSummary: values.appendToSummary,
              userDefaultShowLibraryID: values.userDefaultShowLibraryID,
            });

            toast.success(intl.formatMessage(messages.toastSettingsSuccess));
          } catch (e) {
            toast.error(intl.formatMessage(messages.toastSettingsFailure));
          } finally {
            revalidate();
            revalidateUser();
          }
        }}
      >
        {({
          errors,
          touched,
          values,
          handleSubmit,
          isSubmitting,
          setFieldValue,
        }) => {
          return (
            <form className="section" onSubmit={handleSubmit}>
              <div className="form-row">
                <label htmlFor="ssl" className="checkbox-label">
                  {intl.formatMessage(messages.appendtotitlelabel)}
                </label>
                <div className="form-input-area">
                  <Field
                    type="checkbox"
                    id="appendToTitle"
                    name="appendToTitle"
                  />
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="ssl" className="checkbox-label">
                  {intl.formatMessage(messages.appendtosummarylabel)}
                </label>
                <div className="form-input-area">
                  <Field
                    type="checkbox"
                    id="appendToSummary"
                    name="appendToSummary"
                  />
                </div>
              </div>
              <div className="form-row">
                <label
                  htmlFor="userDefaultShowLibraryID"
                  className="text-label"
                >
                  {intl.formatMessage(messages.userDefaultShowLibrary)}
                </label>
                <div className="form-input-area">
                  <div className="form-input-field">
                    <select
                      id="userDefaultShowLibraryID"
                      name="userDefaultShowLibraryID"
                      value={values.userDefaultShowLibraryID}
                      disabled={!plexTVLibraries}
                      className="rounded"
                      onChange={(e) =>
                        setFieldValue(
                          'userDefaultShowLibraryID',
                          e.target.value
                        )
                      }
                    >
                      {plexTVLibraries?.map(
                        (library: PlexLibrary, index: number) => (
                          <option
                            key={`plex-tv-library-${index}`}
                            value={library.id}
                          >
                            {library.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  {errors.userDefaultShowLibraryID &&
                    touched.userDefaultShowLibraryID &&
                    typeof errors.userDefaultShowLibraryID === 'string' && (
                      <div className="error">
                        {errors.userDefaultShowLibraryID}
                      </div>
                    )}
                </div>
              </div>
              <div className="actions">
                <div className="flex justify-end">
                  <span className="ml-3 inline-flex rounded-md shadow-sm">
                    <Button
                      buttonType="primary"
                      type="submit"
                      disabled={isSubmitting}
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
            </form>
          );
        }}
      </Formik>
    </>
  );
};

export default UserPlaylistSettings;
