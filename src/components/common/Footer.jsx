import React from "react";
import { Navbar, Row } from "react-bootstrap";

const Footer = () => {
  return (
      <Navbar
        className="navbar navbar-expand-sm justify-content-center"
        fixed="bottom"
        bg="dark"
        style={{ color: "white", margin: 0, padding: 0, height: "auto" }}
      >
        Acorn-Beauty &copy; 2024
      </Navbar>
  );
};

export default Footer;
