import styles from "./TopNavigation.module.css";
import axios from "axios";
import { useUser } from "@app/hooks/useUser";
import UserDropdown from "@app/components/Layout/UserDropdown";

type TopNavigationProps = {
  children: React.ReactNode;
};

const TopNavigation = ({ children }: TopNavigationProps) => {
  const { revalidate } = useUser();

  const logout = async () => {
    const response = await axios.post("/api/v1/auth/logout");

    if (response.data?.status === "ok") {
      revalidate();
    }
  };

  return (
    <header className={`${styles["top-menu-main"]} flex p-2 m-2 lg:mx-4 sm:mx-2`}>
      {children}
      <div className={"ms-auto"}>
        <UserDropdown />
      </div>
    </header>
  );
};

export default TopNavigation;
