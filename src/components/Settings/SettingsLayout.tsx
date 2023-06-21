import PageTitle from "@app/components/Common/PageTitle";
import type { SettingsRoute } from "@app/components/Common/SettingsTabs";
import SettingsTabs from "@app/components/Common/SettingsTabs";
import Card from "../Common/Card";
import Header from "../Common/Header";
import { useIntl, defineMessages } from "react-intl";

const messages = defineMessages({
  menuGeneralSettings: "General",
  menuUsers: "Users",
  menuPlexSettings: "Plex",
  menuLogs: "Logs",
  menuAbout: "About",
  settings: "Settings"
});

type SettingsLayoutProps = {
  children: React.ReactNode;
};

const SettingsLayout = ({ children }: SettingsLayoutProps) => {
  const intl = useIntl();
  const settingsRoutes: SettingsRoute[] = [
    {
      text: intl.formatMessage(messages.menuGeneralSettings),
      route: "/settings/main",
      regex: /^\/settings(\/main)?$/,
    },
    {
      text: intl.formatMessage(messages.menuUsers),
      route: "/settings/users",
      regex: /^\/settings\/users/,
    },
    {
      text: intl.formatMessage(messages.menuPlexSettings),
      route: "/settings/plex",
      regex: /^\/settings\/plex/,
    },
    {
      text: intl.formatMessage(messages.menuLogs),
      route: "/settings/logs",
      regex: /^\/settings\/logs/,
    },
    {
      text: intl.formatMessage(messages.menuAbout),
      route: "/settings/about",
      regex: /^\/settings\/about/,
    },
  ];

  return (
    <>
      <PageTitle title={"Settings"} />
      <Header extraMargin={10} >{intl.formatMessage(messages.settings)}</Header>
      <Card className="p-6">
        <SettingsTabs settingsRoutes={settingsRoutes} />

        <div className="mt-10 text-white">{children}</div>
      </Card>
    </>
  );
};

export default SettingsLayout;
