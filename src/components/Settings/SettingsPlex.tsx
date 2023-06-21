import Alert from "@app/components/Common/Alert";
import Button from "@app/components/Common/Button";
import PageTitle from "@app/components/Common/PageTitle";
import { ArrowDownOnSquareIcon } from "@heroicons/react/24/outline";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import type { PlexDevice } from "@server/interfaces/api/plexInterfaces";
import type { PlexSettings } from "@server/lib/settings";
import axios from "axios";
import { Field, Formik } from "formik";
import { orderBy } from "lodash";
import { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import * as Yup from "yup";
import { defineMessages, useIntl } from "react-intl";
import globalMessages from "@app/i18n/globalMessages";

const messages = defineMessages({
  settings: "Settings",
  plex: "Plex",
  plexsettings: "Plex Settings",
  plexsettingsDescription: "Configure the settings for your Plex server.",
  serverpreset: "Server",
  serverLocal: "local",
  serverRemote: "remote",
  serverSecure: "secure",
  serverpresetManualMessage: "Manual configuration",
  serverpresetRefreshing: "Retrieving servers…",
  serverpresetLoad: "Press the button to load available servers",
  toastPlexRefresh: "Retrieving server list from Plex…",
  toastPlexRefreshSuccess: "Plex server list retrieved successfully!",
  toastPlexRefreshFailure: "Failed to retrieve Plex server list.",
  toastPlexConnecting: "Attempting to connect to Plex…",
  toastPlexConnectingSuccess: "Plex connection established successfully!",
  toastPlexConnectingFailure: "Failed to connect to Plex.",
  settingUpPlexDescription:
    "To set up Plex, you can either enter the details manually or select a server retrieved from plex.tv. Press the button to the right of the dropdown to fetch the list of available servers.",
  hostname: "Hostname or IP Address",
  port: "Port",
  enablessl: "Use SSL",
  validationHostnameRequired: "You must provide a valid hostname or IP address",
  validationPortRequired: "You must provide a valid port number",
  validationUrl: "You must provide a valid URL",
  testServerConnection: "Test Server Connection"
});

interface PresetServerDisplay {
  name: string;
  ssl: boolean;
  uri: string;
  address: string;
  port: number;
  local: boolean;
  status?: boolean;
  message?: string;
}
interface SettingsPlexProps {
  onComplete?: () => void;
}

const SettingsPlex = ({ onComplete }: SettingsPlexProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefreshingPresets, setIsRefreshingPresets] = useState(false);
  const [availableServers, setAvailableServers] = useState<PlexDevice[] | null>(
    null
  );
  const {
    data,
    error,
    mutate: revalidate,
  } = useSWR<PlexSettings>("/api/v1/settings/plex");
  const intl = useIntl();

  const PlexSettingsSchema = Yup.object().shape({
    hostname: Yup.string()
      .nullable()
      .required(intl.formatMessage(messages.validationHostnameRequired))
      .matches(
        /^(((([a-z]|\d|_|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*)?([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])):((([a-z]|\d|_|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*)?([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))@)?(([a-z]|\d|_|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*)?([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])$/i,
        intl.formatMessage(messages.validationHostnameRequired)
      ),
    port: Yup.number()
      .nullable()
      .required(intl.formatMessage(messages.validationPortRequired)),
    webAppUrl: Yup.string()
      .nullable()
      .url(intl.formatMessage(messages.validationUrl)),
  });

  const activeLibraries =
    data?.libraries
      .filter((library) => library.enabled)
      .map((library) => library.id) ?? [];

  const availablePresets = useMemo(() => {
    const finalPresets: PresetServerDisplay[] = [];
    availableServers?.forEach((dev) => {
      dev.connection.forEach((conn) =>
        finalPresets.push({
          name: dev.name,
          ssl: conn.protocol === "https",
          uri: conn.uri,
          address: conn.address,
          port: conn.port,
          local: conn.local,
          status: conn.status === 200,
          message: conn.message,
        })
      );
    });

    return orderBy(finalPresets, ["status", "ssl"], ["desc", "desc"]);
  }, [availableServers]);

  const syncLibraries = async () => {
    setIsSyncing(true);

    const params: { sync: boolean; enable?: string } = {
      sync: true,
    };

    if (activeLibraries.length > 0) {
      params.enable = activeLibraries.join(",");
    }

    await axios.get("/api/v1/settings/plex/library", {
      params,
    });
    setIsSyncing(false);
    revalidate();
  };

  const refreshPresetServers = async () => {
    setIsRefreshingPresets(true);
    let toastId: string | undefined;
    try {
      toastId = toast.loading(intl.formatMessage(messages.toastPlexRefresh));

      const response = await axios.get<PlexDevice[]>(
        "/api/v1/settings/plex/devices/servers"
      );
      if (response.data) {
        setAvailableServers(response.data);
      }
      if (toastId) {
        toast.dismiss(toastId);
      }

      toastId = toast.success(
        intl.formatMessage(messages.toastPlexRefreshSuccess)
      );
    } catch (e) {
      if (toastId) {
        toast.dismiss(toastId);
      }

      toast.error(intl.formatMessage(messages.toastPlexRefreshFailure));
    } finally {
      setIsRefreshingPresets(false);
    }
  };

  return (
    <>
      <PageTitle
        title={[
          intl.formatMessage(messages.plex),
          intl.formatMessage(messages.settings),
        ]}
      />
      <div className="mb-6">
        <h3 className="heading">{intl.formatMessage(messages.plexsettings)}</h3>
        <p className="description">
          {intl.formatMessage(messages.plexsettingsDescription)}
        </p>
        {!!onComplete && (
          <div className="section">
            <Alert
              title={intl.formatMessage(messages.settingUpPlexDescription, {
                RegisterPlexTVLink: (msg: React.ReactNode) => (
                  <a
                    href="https://plex.tv"
                    className="text-white transition duration-300 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {msg}
                  </a>
                ),
              })}
              type="info"
            />
          </div>
        )}
      </div>
      <Formik
        initialValues={{
          hostname: data?.ip,
          port: data?.port ?? 32400,
          useSsl: data?.useSsl,
          preset: undefined,
          webAppUrl: data?.webAppUrl,
        }}
        enableReinitialize={true}
        validationSchema={PlexSettingsSchema}
        onSubmit={async (values) => {
          let toastId: string | null = null;
          try {
            toastId = toast.loading(
              intl.formatMessage(messages.toastPlexConnecting)
            );

            await axios.post("/api/v1/settings/plex", {
              ip: values.hostname,
              port: Number(values.port),
              useSsl: values.useSsl,
              webAppUrl: values.webAppUrl,
            } as PlexSettings);

            syncLibraries();

            if (toastId) {
              toast.dismiss(toastId);
            }
            toastId = toast.success(
              intl.formatMessage(messages.toastPlexConnectingSuccess)
            );
            if (onComplete) {
              onComplete();
            }
          } catch (e) {
            if (toastId) {
              toast.dismiss(toastId);
            }
            toast.error(
              intl.formatMessage(messages.toastPlexConnectingFailure)
            );
          }
        }}
      >
        {({
          errors,
          touched,
          values,
          handleSubmit,
          setFieldValue,
          isSubmitting,
          isValid,
        }) => {
          return (
            <form className="section" onSubmit={handleSubmit}>
              <div className="form-row">
                <label htmlFor="preset" className="text-label">
                  {intl.formatMessage(messages.serverpreset)}
                </label>
                <div className="form-input-area">
                  <div className="form-input-field">
                    <select
                      id="preset"
                      name="preset"
                      value={values.preset}
                      disabled={!availableServers || isRefreshingPresets}
                      className="rounded-l-only"
                      onChange={async (e) => {
                        const targPreset =
                          availablePresets[Number(e.target.value)];

                        if (targPreset) {
                          setFieldValue("hostname", targPreset.address);
                          setFieldValue("port", targPreset.port);
                          setFieldValue("useSsl", targPreset.ssl);
                        }
                      }}
                    >
                      <option value="manual">
                        {availableServers || isRefreshingPresets
                          ? isRefreshingPresets
                            ? intl.formatMessage(
                                messages.serverpresetRefreshing
                              )
                            : intl.formatMessage(
                                messages.serverpresetManualMessage
                              )
                          : intl.formatMessage(messages.serverpresetLoad)}
                      </option>
                      {availablePresets.map((server, index) => (
                        <option
                          key={`preset-server-${index}`}
                          value={index}
                          disabled={!server.status}
                        >
                          {`
                            ${server.name} (${server.address})
                            [${
                              server.local
                                ? intl.formatMessage(messages.serverLocal)
                                : intl.formatMessage(messages.serverRemote)
                            }]${
                            server.ssl
                              ? ` [${intl.formatMessage(
                                  messages.serverSecure
                                )}]`
                              : ""
                          }
                            ${server.status ? "" : "(" + server.message + ")"}
                          `}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        refreshPresetServers();
                      }}
                      className="input-action"
                    >
                      <ArrowPathIcon
                        className={isRefreshingPresets ? "animate-spin" : ""}
                        style={{ animationDirection: "reverse" }}
                      />
                    </button>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="hostname" className="text-label">
                  {intl.formatMessage(messages.hostname)}
                  <span className="label-required">*</span>
                </label>
                <div className="form-input-area">
                  <div className="form-input-field h-9">
                    <span className="block inline-flex cursor-default items-center rounded-l-md border border-r-0 border-gray-500 bg-gray-800 px-3 text-gray-100">
                      {values.useSsl ? "https://" : "http://"}
                    </span>
                    <Field
                      type="text"
                      inputMode="url"
                      id="hostname"
                      name="hostname"
                      value={values.hostname}
                      className="rounded-r-only "
                    />
                  </div>
                  {errors.hostname &&
                    touched.hostname &&
                    typeof errors.hostname === "string" && (
                      <div className="error">{errors.hostname}</div>
                    )}
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="port" className="text-label">
                  {intl.formatMessage(messages.port)}
                  <span className="label-required">*</span>
                </label>
                <div className="form-input-area">
                  <Field
                    type="text"
                    inputMode="numeric"
                    id="port"
                    name="port"
                    className="short h-9"
                    value={values.port}
                  />
                  {errors.port &&
                    touched.port &&
                    typeof errors.port === "string" && (
                      <div className="error">{errors.port}</div>
                    )}
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="ssl" className="checkbox-label">
                  {intl.formatMessage(messages.enablessl)}
                </label>
                <div className="form-input-area">
                  <Field
                    type="checkbox"
                    id="useSsl"
                    name="useSsl"
                    onChange={() => {
                      setFieldValue("useSsl", !values.useSsl);
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <label htmlFor="testServerConnectionBtn" className="text-label">
                  {intl.formatMessage(messages.testServerConnection)}
                </label>
                <span className="ml-3 inline-flex rounded-md shadow-sm">
                  <Button
                    id="testServerConnectionBtn"
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

export default SettingsPlex;
