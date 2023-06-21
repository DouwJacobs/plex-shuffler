import React from "react";

import styles from "./Card.module.css";

const Card = (props: { className: string; style?: any ; children: any }) => {
  return (
    <div className={`${styles.card} ${props.className}`} style={props.style}>
      {props.children}
    </div>
  );
};

export default Card;
