import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-page">

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to <span>LegalEase</span></h1>
          <p className="hero-subtitle">
            An intelligent platform that simplifies Indian legal research using AI — 
            for lawyers, students, and citizens alike.
          </p>
          <div className="hero-buttons">
            <Link to="/summarize" className="btn-primary">Try Case Summarizer</Link>
            <Link to="/login" className="btn-secondary">Get Started</Link>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <h2 className="section-title">Our Core Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>⚖️ AI Case Summarizer</h3>
            <p>
              Analyze complex Indian legal cases and generate quick, easy-to-understand summaries.
            </p>
            <Link to="/summarize" className="btn-link">Try Now →</Link>
          </div>

          <div className="feature-card">
            <h3>👨‍💼 Lawyer Dashboard</h3>
            <p>
              Manage clients, access case updates, and receive important legal notifications.
            </p>
            <Link to="/lawyer-dashboard" className="btn-link">Go to Dashboard →</Link>
          </div>

          <div className="feature-card">
            <h3>🎓 Student Portal</h3>
            <p>
              Learn through real court cases explained in simpler terms — ideal for law students.
            </p>
            <Link to="/student-dashboard" className="btn-link">Explore →</Link>
          </div>

          <div className="feature-card">
            <h3>🔔 Notifications</h3>
            <p>
              Get real-time alerts about cases, judgments, and personalized legal insights.
            </p>
            <Link to="/lawyer-notifications" className="btn-link">View Notifications →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
