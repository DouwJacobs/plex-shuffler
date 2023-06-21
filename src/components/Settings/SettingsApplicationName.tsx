import Button from '@app/components/Common/Button';
import { ArrowDownOnSquareIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { Field, Formik } from 'formik';
import toast from 'react-hot-toast';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';
import * as Yup from 'yup';

const messages = defineMessages({
  applicationName: 'Application Name',
  applicationNameDescription: 'Choose a name for your application',
  applicationNameRequired: 'Please set valid application name',
  applicationTitleFailed: 'Error setting application title',
  applicationTitleSuccess: 'Application title set successfully',
  applicationTitle: 'Application Title',
  applicationTitleSave: 'Save Application Title',
});

type ApplicationTitle = {
  applicationTitle: string;
};

interface SettingsApplicationProps {
  onComplete?: () => void;
}

const SettingsApplicationName = ({ onComplete }: SettingsApplicationProps) => {
  const { data } = useSWR<ApplicationTitle>('/api/v1/settings/title');
  const intl = useIntl();

  const ApplicationNameSchema = Yup.object().shape({
    applicationTitle: Yup.string()
      .nullable()
      .required(intl.formatMessage(messages.applicationNameRequired)),
  });
  return (
    <>
      <div className="mb-6">
        <h3 className="heading">
          {intl.formatMessage(messages.applicationName)}
        </h3>
        <p className="description">
          {intl.formatMessage(messages.applicationNameDescription)}
        </p>
      </div>
      <Formik
        initialValues={{
          applicationTitle: data?.applicationTitle,
        }}
        enableReinitialize={true}
        validationSchema={ApplicationNameSchema}
        onSubmit={async (values) => {
          let toastId: string | null = null;
          toastId = toast.loading('Setting Application Title');
          try {
            await axios.post('/api/v1/settings/title', {
              applicationTitle: values.applicationTitle,
            });

            if (toastId) {
              toast.dismiss(toastId);
            }

            toastId = toast.success(
              intl.formatMessage(messages.applicationTitleSuccess)
            );
            if (onComplete) {
              onComplete();
            }
          } catch (e) {
            if (toastId) {
              toast.dismiss(toastId);
            }
            toast.error(intl.formatMessage(messages.applicationTitleFailed));
          }
        }}
      >
        {({ errors, touched, values, handleSubmit, isSubmitting }) => {
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
                    inputMode="numeric"
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
              <div className="mt-2 flex justify-end">
                <label htmlFor="saveTitle" className="text-label">
                  {intl.formatMessage(messages.applicationTitleSave)}
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

export default SettingsApplicationName;
