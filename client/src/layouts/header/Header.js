import React from "react";
import { Navbar, Collapse, Nav, Button } from "reactstrap";

const Header = ({ showMobmenu }) => {
  const [isOpen] = React.useState(false);

  return (
    <Navbar color="black" dark expand="md">
      <div className="d-flex align-items-center">
        <Button color="primary" className="d-lg-none" onClick={showMobmenu}>
          <i className="bi bi-list"></i>
        </Button>
      </div>

      <Collapse navbar isOpen={isOpen}>
        <Nav
          className="container-fluid d-flex justify-content-between align-items-center"
          navbar
        ></Nav>
      </Collapse>
    </Navbar>
  );
};

export default Header;
