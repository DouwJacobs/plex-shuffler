import React from "react";
import Logo from "@app/components/Common/Logo";
import Card from "@app/components/Common/Card";

const error404 = () => {
  return (
    <React.Fragment>
      <Logo />
      <Card className="default-card">
        <div className="default-card-content">
          <h2>Error</h2>
          <p>The requested content cannot be found!</p>
        </div>
      </Card>
    </React.Fragment>
  );
};

export default error404;