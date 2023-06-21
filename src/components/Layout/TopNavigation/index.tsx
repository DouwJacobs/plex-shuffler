import UserDropdown from '@app/components/Layout/UserDropdown';
import styles from './TopNavigation.module.css';

type TopNavigationProps = {
  children: React.ReactNode;
};

const TopNavigation = ({ children }: TopNavigationProps) => {
  return (
    <header
      className={`${styles['top-menu-main']} m-2 flex p-2 sm:mx-2 lg:mx-4`}
    >
      {children}
      <div className={'ms-auto'}>
        <UserDropdown />
      </div>
    </header>
  );
};

export default TopNavigation;
