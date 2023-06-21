import Button from "@app/components/Common/Button";
import LoadingSpinner from "@app/components/Common/LoadingSpinner";
import PageTitle from "@app/components/Common/PageTitle";
import PermissionEdit from "@app/components/PermissionEdit";
import globalMessages from "@app/i18n/globalMessages";
import { ArrowDownOnSquareIcon } from "@heroicons/react/24/outline";
import type { MainSettings } from "@server/lib/settings";
import axios from "axios";
import { Field, Form, Formik } from "formik";
import { defineMessages, useIntl } from "react-intl";
import toast from "react-hot-toast";
import useSWR, { mutate } from "swr";

const messages = defineMessages({
  users: "Users",
  userSettings: "User Settings",
  userSettingsDescription: "Configure global and default user settings.",
  toastSettingsSuccess: "User settings saved successfully!",
  toastSettingsFailure: "Something went wrong while saving settings.",
  localLogin: "Enable Local Sign-In",
  localLoginTip:
    "Allow users to sign in using their email address and password, instead of Plex OAuth",
  newPlexLogin: "Enable New Plex Sign-In",
  newPlexLoginTip: "Allow Plex users to sign in without first being imported",
  movieRequestLimitLabel: "Global Movie Request Limit",
  tvRequestLimitLabel: "Global Series Request Limit",
  defaultPermissions: "Default Permissions",
  defaultPermissionsTip: "Initial permissions assigned to new users",
});

const SettingsUsers = () => {
  const intl = useIntl();
  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<MainSettings>("/api/v1/settings/main");

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <PageTitle
        title={[
          intl.formatMessage(messages.users),
          intl.formatMessage(globalMessages.settings),
        ]}
      />
      <div className="mb-6">
        <h3 className="heading">{intl.formatMessage(messages.userSettings)}</h3>
        <p className="description">
          {intl.formatMessage(messages.userSettingsDescription)}
        </p>
      </div>
      <div className="section">
        <Formik
          initialValues={{
            newPlexLogin: data?.newPlexLogin,
            defaultPermissions: data?.defaultPermissions ?? 0,
          }}
          enableReinitialize
          onSubmit={async (values) => {
            try {
              await axios.post("/api/v1/settings/main", {
                newPlexLogin: values.newPlexLogin,
                defaultPermissions: values.defaultPermissions,
              });
              mutate("/api/v1/settings/public");

              toast.success(intl.formatMessage(messages.toastSettingsSuccess));
            } catch (e) {
              toast.error(intl.formatMessage(messages.toastSettingsFailure));
            } finally {
              revalidate();
            }
          }}
        >
          {({ isSubmitting, values, setFieldValue }) => {
            return (
              <Form className="section">
                <div className="form-row">
                  <label htmlFor="newPlexLogin" className="checkbox-label">
                    {intl.formatMessage(messages.newPlexLogin)}
                    <span className="label-tip">
                      {intl.formatMessage(messages.newPlexLoginTip)}
                    </span>
                  </label>
                  <div className="form-input-area">
                    <Field
                      type="checkbox"
                      id="newPlexLogin"
                      name="newPlexLogin"
                      onChange={() => {
                        setFieldValue("newPlexLogin", !values.newPlexLogin);
                      }}
                    />
                  </div>
                </div>
                <div
                  role="group"
                  aria-labelledby="group-label"
                  className="form-group"
                >
                  <div className="form-row">
                    <span id="group-label" className="group-label">
                      {intl.formatMessage(messages.defaultPermissions)}
                      <span className="label-tip">
                        {intl.formatMessage(messages.defaultPermissionsTip)}
                      </span>
                    </span>
                    <div className="form-input-area">
                      <div className="max-w-lg">
                        <PermissionEdit
                          currentPermission={values.defaultPermissions}
                          onUpdate={(newPermissions) =>
                            setFieldValue("defaultPermissions", newPermissions)
                          }
                        />
                      </div>
                    </div>
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
                            ? intl.formatMessage(globalMessages.saving)
                            : intl.formatMessage(globalMessages.save)}
                        </span>
                      </Button>
                    </span>
                  </div>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </>
  );
};

export default SettingsUsers;
