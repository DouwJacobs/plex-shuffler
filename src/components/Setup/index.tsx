import Card from '@app/components/Common/Card';
import Logo from '@app/components/Common/Logo';
import LanguagePicker from '@app/components/Layout/LanguagePicker';
import React from 'react';
import styles from './Setup.module.css';
import SetupContent from './SetupContent';

const Setup = () => {
  return (
    <React.Fragment>
      <Logo />
      <div className="absolute right-4 top-4 z-50">
        <LanguagePicker />
      </div>
      <Card className={styles['setup-card']}>
        <div className={styles['setup-content']}>
          <SetupContent />
        </div>
      </Card>
    </React.Fragment>
  );
};

export default Setup;
