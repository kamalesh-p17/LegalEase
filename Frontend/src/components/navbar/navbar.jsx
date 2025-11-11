import React, { useState } from "react";
import { Link } from "react-router-dom";
import LawyerSearch from "../LawyerSearch/LawyerSearch";
import "./navbarStyles.css";

function Navbar({ isLoggedIn, userRole }) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      {/* Navbar Header */}
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-logo">
            <Link to="/">LegalEase</Link>
          </div>

          {/* Search Toggle Button */}
          {userRole === "common" && <button
            className="nav-link search-toggle-btn"
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? "Close Search" : "Search Lawyer"}
          </button>}

          {/* Navigation Links */}
          <ul className="navbar-links">
            {!isLoggedIn && (
              <li>
                <Link to="/login" className="nav-link">Login / Register</Link>
              </li>
            )}

            <li>
              <a href="http://localhost:8080" className="nav-link">
                AI Summarizer
              </a>
            </li>

            {isLoggedIn && (
              <>
                {userRole === "common" && (
                  <li>
                    <Link to="/dashboard" className="nav-link">
                      Dashboard
                    </Link>
                  </li>
                )}

                {userRole === "lawyer" && (
                  <>
                    <li>
                      <Link to="/lawyer-dashboard" className="nav-link">
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link to="/lawyer-notifications" className="nav-link">
                        Notifications
                      </Link>
                    </li>
                  </>
                )}

                {userRole === "student" && (
                  <li>
                    <Link to="/student-dashboard" className="nav-link">
                      Dashboard
                    </Link>
                  </li>
                )}

                <li>
                  <button
                    className="nav-link logout-btn"
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      {/* Conditional LawyerSearch Display */}
      {showSearch && (
        <div className="search-panel">
          <LawyerSearch goBack={() => setShowSearch(false)} />
        </div>
      )}
    </>
  );
}

export default Navbar;
