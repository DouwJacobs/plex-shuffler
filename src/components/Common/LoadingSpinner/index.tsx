import styles from './Spinner.module.css';

export default function Spinner({
  className,
}: {
  className?: string | undefined;
}) {
  return (
    <div className={`${styles['spinner-container']} ${className}`}>
      <div className={`${styles['loading-spinner']} ${className}`}></div>
    </div>
  );
}
