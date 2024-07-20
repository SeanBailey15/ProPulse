import React, { useState, useContext } from "react";
import UserContext from "../contexts/UserContext";
import { Link } from "react-router-dom";
import { Collapse, Navbar, NavbarToggler, Nav, NavItem } from "reactstrap";
import "../styles/NavBar.css";

export default function NavBar(args) {
  const { currentUser, logout } = useContext(UserContext);

  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="Nav">
      <Navbar {...args}>
        <Link className="Nav-brand" to="/">
          <img
            src="../public/icons/ProPulse-navBrand.svg"
            alt=""
            width="200px"
            height="50px"
          />
        </Link>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} className="Navbar-collapse">
          <Nav className="ms-auto" navbar>
            {currentUser && (
              <NavItem>
                <Link className="Nav-link" to="/" onClick={logout}>
                  Logout
                </Link>
              </NavItem>
            )}
            {currentUser && (
              <NavItem>
                <Link className="Nav-link" to={`users/${currentUser.username}`}>
                  <span className="material-symbols-outlined">person</span>
                </Link>
              </NavItem>
            )}
            {!currentUser && (
              <NavItem>
                <Link className="Nav-link" to="/signup">
                  Sign Up
                </Link>
              </NavItem>
            )}
            {!currentUser && (
              <NavItem>
                <Link className="Nav-link" to="/login">
                  Login
                </Link>
              </NavItem>
            )}
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
}
