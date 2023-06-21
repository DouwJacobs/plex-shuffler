import React from "react";
import SetupContent from "./SetupContent";
import Logo from "@app/components/Common/Logo";
import Card from "@app/components/Common/Card";
import styles from "./Setup.module.css"
import LanguagePicker from '@app/components/Layout/LanguagePicker';

const Setup = () => {
  return (
    <React.Fragment>
      <Logo />
      <div className="absolute top-4 right-4 z-50">
        <LanguagePicker />
      </div>
      <Card className={styles["setup-card"]}>
        <div className={styles["setup-content"]}>
          <SetupContent />
        </div>
      </Card>
    </React.Fragment>
  );
};

export default Setup;
