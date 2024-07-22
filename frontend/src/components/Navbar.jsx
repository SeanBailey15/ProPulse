import React, { useState, useContext, useRef, useEffect } from "react";
import UserContext from "../contexts/UserContext";
import { Link } from "react-router-dom";
import { Collapse, Navbar, NavbarToggler, Nav, NavItem } from "reactstrap";
import "../styles/NavBar.css";

export default function NavBar(args) {
  const { currentUser, logout } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);

  const toggle = () => setIsOpen(!isOpen);

  const handleClickOutside = (event) => {
    if (navRef.current && !navRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="Nav" ref={navRef}>
      <Navbar {...args}>
        <Link className="Nav-brand" to="/">
          <img
            src="../icons/ProPulse-navBrand.svg"
            alt="Propulse logo"
            width="200px"
            height="50px"
          />
        </Link>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} className="Nav-collapse">
          <Nav className="ms-auto" navbar>
            {currentUser && (
              <NavItem>
                <Link
                  className="Nav-link"
                  to="/"
                  onClick={() => {
                    logout();
                    toggle();
                  }}
                >
                  Logout
                </Link>
              </NavItem>
            )}
            {currentUser && (
              <NavItem>
                <Link
                  className="Nav-link"
                  to={`/users/dashboard/${currentUser.id}`}
                  onClick={() => {
                    toggle();
                  }}
                >
                  Dashboard
                </Link>
              </NavItem>
            )}
            {currentUser && (
              <>
                <NavItem className="d-none d-md-block">
                  <Link
                    className="Nav-link"
                    to={`users/${currentUser.id}`}
                    onClick={toggle}
                  >
                    <span className="material-symbols-outlined">person</span>
                  </Link>
                </NavItem>
                <NavItem className="d-md-none">
                  <Link
                    className="Nav-link"
                    to={`users/${currentUser.id}`}
                    onClick={toggle}
                  >
                    Profile
                  </Link>
                </NavItem>
              </>
            )}
            {!currentUser && (
              <NavItem>
                <Link className="Nav-link" to="/signup" onClick={toggle}>
                  Sign Up
                </Link>
              </NavItem>
            )}
            {!currentUser && (
              <NavItem>
                <Link className="Nav-link" to="/login" onClick={toggle}>
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
