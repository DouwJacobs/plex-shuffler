import styles from "./Logo.module.css";

import logo from "@app/assets/images/plex_shuffler_logo.png"


const Logo = () => {
    return <img src={logo.src} className={styles.logo} alt="Plex Shuffler Logo" />
};

export default Logo;