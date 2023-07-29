import Button from '@app/components/Common/Button';
import { ArrowDownOnSquareIcon } from '@heroicons/react/24/outline';
import type { PlexLibrary } from '@server/interfaces/api/plexInterfaces';
import axios from 'axios';
import { Field, Formik } from 'formik';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import * as Yup from 'yup';

const messages = defineMessages({
  settingsGeneral: 'General Settings',
  applicationNameRequired: 'Please set valid application name',
  settingsFailed: 'Error saving settings',
  settingsSuccess: 'Settings saved successfully',
  applicationTitle: 'Application Title',
  settingsSave: 'Save',
  defaultShowLibrary: 'Default TV Show Library',
  defaultShowLibraryRequired: 'Please select default Plex TV Show library',
  defaultMovieLibrary: 'Default Movie Library',
  defaultMovieLibraryRequired: 'Please select default Plex Movie library',
});

type GeneralSettings = {
  applicationTitle: string;
  defaultShowLibrary: string | number;
  defaultMovieLibrary: string | number;
};

interface SettingsApplicationProps {
  onComplete?: () => void;
}

const SettingsGeneral = ({ onComplete }: SettingsApplicationProps) => {
  const { data } = useSWR<GeneralSettings>('/api/v1/settings/general');
  const { data: plexTVLibraries } = useSWR<PlexLibrary[]>(
    '/api/v1/tv/libraries'
  );
  const { data: plexMovieLibraries } = useSWR<PlexLibrary[]>(
    '/api/v1/movies/libraries'
  );
  const intl = useIntl();
  const [plexShowLibraryIds, setPlexShowLibraryIds] = useState<any[]>([]);
  const [plexMovieLibraryIds, setPlexMovieLibraryIds] = useState<any[]>([]);

  useEffect(() => {
    plexTVLibraries?.map((library) =>
      setPlexShowLibraryIds((prevValues) => [...prevValues, library.id])
    );
  }, [plexTVLibraries]);

  useEffect(() => {
    plexMovieLibraries?.map((library) =>
      setPlexMovieLibraryIds((prevValues) => [...prevValues, library.id])
    );
  }, [plexMovieLibraries]);

  const GeneralSettingsSchema = Yup.object().shape({
    applicationTitle: Yup.string()
      .nullable()
      .required(intl.formatMessage(messages.applicationNameRequired)),
    defaultShowLibrary: Yup.string()
      .required(intl.formatMessage(messages.defaultShowLibraryRequired))
      .oneOf(plexShowLibraryIds),
    defaultMovieLibrary: Yup.string()
      .required(intl.formatMessage(messages.defaultMovieLibraryRequired))
      .oneOf(plexMovieLibraryIds),
  });
  return (
    <>
      <div className="mb-6">
        <h3 className="heading">
          {intl.formatMessage(messages.settingsGeneral)}
        </h3>
      </div>
      <Formik
        initialValues={{
          applicationTitle: data?.applicationTitle,
          defaultShowLibrary:
            data?.defaultShowLibrary === 'Not Defined'
              ? plexShowLibraryIds[0]
              : data?.defaultShowLibrary,
          defaultMovieLibrary:
            data?.defaultMovieLibrary === 'Not Defined'
              ? plexMovieLibraryIds[0]
              : data?.defaultMovieLibrary,
        }}
        enableReinitialize={true}
        validationSchema={GeneralSettingsSchema}
        onSubmit={async (values) => {
          let toastId: string | null = null;
          toastId = toast.loading('Saving...');
          try {
            await axios.post('/api/v1/settings/general', {
              applicationTitle: values.applicationTitle,
              defaultShowLibrary: values.defaultShowLibrary,
              defaultMovieLibrary: values.defaultMovieLibrary,
            });

            if (toastId) {
              toast.dismiss(toastId);
            }

            toastId = toast.success(
              intl.formatMessage(messages.settingsSuccess)
            );
            if (onComplete) {
              onComplete();
            }
          } catch (e) {
            if (toastId) {
              toast.dismiss(toastId);
            }
            toast.error(intl.formatMessage(messages.settingsFailed));
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
                <label htmlFor="port" className="text-label">
                  {intl.formatMessage(messages.applicationTitle)}
                  <span className="label-required">*</span>
                </label>
                <div className="form-input-area">
                  <Field
                    type="text"
                    id="applicationTitleInput"
                    name="applicationTitle"
                    className="block h-9"
                    value={values.applicationTitle}
                  />
                  {errors.applicationTitle &&
                    touched.applicationTitle &&
                    typeof errors.applicationTitle === 'string' && (
                      <div className="error">{errors.applicationTitle}</div>
                    )}
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="defaultShowLibrary" className="text-label">
                  {intl.formatMessage(messages.defaultShowLibrary)}
                  <span className="label-required">*</span>
                </label>
                <div className="form-input-area">
                  <div className="form-input-field">
                    <select
                      id="defaultShowLibrary"
                      name="defaultShowLibrary"
                      value={values.defaultShowLibrary}
                      disabled={!plexTVLibraries}
                      className="rounded"
                      onChange={(e) =>
                        setFieldValue('defaultShowLibrary', e.target.value)
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
                  {errors.defaultShowLibrary &&
                    touched.defaultShowLibrary &&
                    typeof errors.defaultShowLibrary === 'string' && (
                      <div className="error">{errors.defaultShowLibrary}</div>
                    )}
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="defaultMovieLibrary" className="text-label">
                  {intl.formatMessage(messages.defaultMovieLibrary)}
                  <span className="label-required">*</span>
                </label>
                <div className="form-input-area">
                  <div className="form-input-field">
                    <select
                      id="defaultMovieLibrary"
                      name="defaultMovieLibrary"
                      value={values.defaultMovieLibrary}
                      disabled={!plexMovieLibraries}
                      className="rounded"
                      onChange={(e) =>
                        setFieldValue('defaultMovieLibrary', e.target.value)
                      }
                    >
                      {plexMovieLibraries?.map(
                        (library: PlexLibrary, index: number) => (
                          <option
                            key={`plex-movie-library-${index}`}
                            value={library.id}
                          >
                            {library.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  {errors.defaultMovieLibrary &&
                    touched.defaultMovieLibrary &&
                    typeof errors.defaultMovieLibrary === 'string' && (
                      <div className="error">{errors.defaultMovieLibrary}</div>
                    )}
                </div>
              </div>

              <div className="mt-2 flex justify-end">
                <label htmlFor="saveTitle" className="text-label">
                  {intl.formatMessage(messages.settingsSave)}
                </label>
                <span className="ml-3 inline-flex rounded-md shadow-sm">
                  <Button
                    id="saveTitle"
                    buttonType="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    <ArrowDownOnSquareIcon />
                  </Button>
                </span>
              </div>
            </form>
          );
        }}
      </Formik>
    </>
  );
};

export default SettingsGeneral;
