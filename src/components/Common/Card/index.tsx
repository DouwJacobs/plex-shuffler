import styles from './Card.module.css';

const Card = (props: {
  className: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) => {
  return (
    <div className={`${styles.card} ${props.className}`} style={props.style}>
      {props.children}
    </div>
  );
};

export default Card;
