import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand Section */}
        <div className="footer-brand">
          <h2 className="footer-logo">LegalEase</h2>
          <p className="footer-description">
            Empowering the Indian legal ecosystem with AI-driven insights and
            user-friendly tools.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><a href="http://localhost:8080">AI Summarizer</a></li>
            <li><Link to="/lawyer-dashboard">Lawyer Dashboard</Link></li>
            <li><Link to="/student-dashboard">Student Portal</Link></li>
            <li><Link to="/lawyer-notifications">Notifications</Link></li>
          </ul>
        </div>

        {/* Contact Section */}
        <div className="footer-contact">
          <h4>Contact</h4>
          <p>Email: <a href="mailto:legalease.support@gmail.com">legalease.support@gmail.com</a></p>
          <p>Phone: +91 98765 43210</p>
          <div className="footer-socials">
            <a href="#" aria-label="LinkedIn">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="#" aria-label="GitHub">
              <i className="fab fa-github"></i>
            </a>
            <a href="#" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} LegalEase • Built by Kamalesh P</p>
      </div>
    </footer>
  );
}
