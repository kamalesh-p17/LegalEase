import React from "react";
import { Link } from "react-router-dom";
import "./navbarStyles.css";

function Navbar({ isLoggedIn, userRole }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">LegalEase</Link>
      </div>

      <ul className="navbar-links">
        {!isLoggedIn && (
          <li>
            <Link to="/">Login / Register</Link>
          </li>
        )}

        {isLoggedIn && (
          <>
            {userRole === "common" && <li><Link to="/dashboard">Dashboard</Link></li>}
            {userRole === "lawyer" && <li><Link to="/lawyer-dashboard">Dashboard</Link></li>}
            {userRole === "student" && <li><Link to="/student-dashboard">Dashboard</Link></li>}
            <li><Link to="/profile">Profile</Link></li>
            <li>
              <Link to="/" onClick={() => localStorage.clear()}>Logout</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
