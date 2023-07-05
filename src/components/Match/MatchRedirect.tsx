import Button from '@app/components/Common/Button';
import Card from '@app/components/Common/Card';
import Header from '@app/components/Common/Header';
import PageTitle from '@app/components/Common/PageTitle';
import { Field, Formik } from 'formik';
import { useRouter } from 'next/navigation';
import { defineMessages, useIntl } from 'react-intl';
import * as Yup from 'yup';

export const messages = defineMessages({
  match: 'Matchflix',
  sessionIDrequired: 'Please enter session ID',
  copiedSessionMessage: 'Session ID successfully copied to clipboard!',
});

const uuidv4 = (): string => {
  return ((1e7).toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(
    /[018]/g,
    function (c) {
      return (
        parseInt(c) ^
        (window.crypto.getRandomValues(new Uint8Array(1))[0] &
          (15 >> (parseInt(c) / 4)))
      ).toString(16);
    }
  );
};

const MatchRedirect = () => {
  const router = useRouter();
  const intl = useIntl();

  const ApplicationNameSchema = Yup.object().shape({
    sessionID: Yup.string()
      .nullable()
      .required(intl.formatMessage(messages.sessionIDrequired)),
  });

  return (
    <>
      <PageTitle title={intl.formatMessage(messages.match)} />
      <div className="mb-5 mt-1">
        <Header>{intl.formatMessage(messages.match)}</Header>
      </div>
      <Card className="m-auto w-full p-5 text-center">
        <Button
          buttonType="primary"
          onClick={() => router.push(`/match/${uuidv4()}`)}
        >
          Create new session
        </Button>
        <p className="m-5">OR</p>
        <Formik
          initialValues={{
            sessionID: '',
          }}
          enableReinitialize={true}
          validationSchema={ApplicationNameSchema}
          onSubmit={async (values) => {
            router.push(`/match/${values.sessionID}`);
          }}
        >
          {({ errors, touched, values, handleSubmit, isSubmitting }) => {
            return (
              <form className="section" onSubmit={handleSubmit}>
                <div className="mb-2 flex flex-grow sm:mb-0 sm:mr-2 md:flex-grow-0">
                  <div className="form-input-area-matches">
                    <Field
                      type="text"
                      id="sessionID"
                      name="sessionID"
                      className="block h-10"
                      placeholder="Session ID"
                      value={values.sessionID}
                    />
                    {errors.sessionID &&
                      touched.sessionID &&
                      typeof errors.sessionID === 'string' && (
                        <div className="error">{errors.sessionID}</div>
                      )}
                  </div>
                  <span className="inline-flex cursor-default items-center px-3 text-sm text-gray-100">
                    <Button
                      id="joinSession"
                      buttonType="primary"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      Join Session
                    </Button>
                  </span>
                </div>
              </form>
            );
          }}
        </Formik>
      </Card>
    </>
  );
};

export default MatchRedirect;
