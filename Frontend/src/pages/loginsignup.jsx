import React, { useState } from "react";
import "./loginsignupStyles.css";

function LoginSignup() {
  const API_BASE_URL = "http://localhost:5000";
  const token = localStorage.getItem("token") || null;
  const Role = localStorage.getItem("role") || null;

  if (!!token) {
    if (Role === "common") window.location.href = "/dashboard";
    else if (Role === "lawyer") window.location.href = "/lawyer-dashboard";
    else window.location.href = "/";
  }

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("common");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    location: "",
    specialization: "",
    experience_years: "",
    bar_council_id: "",
    bar_council_state: "",
    ratings: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!isLogin && formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      let res, data;
      if (isLogin) {
        // LOGIN
        res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });
      } else {
        // REGISTER
        res = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, role }),
        });
      }

      data = await res.json();
      if (!res.ok) throw new Error(data.message || "Authentication failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("username", data.user.name);
      alert(`${isLogin ? "Login" : "Registration"} successful!`);

      const userRole = data.user.role;
      if (userRole === "common") window.location.href = "/dashboard";
      else if (userRole === "lawyer") window.location.href = "/lawyer-dashboard";
      else window.location.href = "/";
    } catch (err) {
      alert(err.message);
    }

    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      location: "",
      specialization: "",
      experience_years: "",
      bar_council_id: "",
      bar_council_state: "",
      ratings: "",
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">
          {isLogin ? "Welcome Back" : "Create an Account"}
        </h2>
        <p className="login-subtext">
          {isLogin
            ? "Sign in to access your LegalEase dashboard"
            : "Join LegalEase and simplify your legal journey"}
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <>
              <label className="form-label">
                Select Role
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="common">Common User</option>
                  <option value="lawyer">Lawyer</option>
                  <option value="student">Student</option>
                </select>
              </label>

              <input
                name="name"
                placeholder="Full Name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                name="phone"
                placeholder="Phone Number"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="form-input"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          )}

          {!isLogin && role === "common" && (
            <input
              name="location"
              placeholder="Your City / Location"
              className="form-input"
              value={formData.location}
              onChange={handleChange}
              required
            />
          )}

          {/* Lawyer Registration Section */}
          {!isLogin && role === "lawyer" && (
            <>
              <input
                name="location"
                placeholder="Office Location"
                className="form-input"
                value={formData.location}
                onChange={handleChange}
                required
              />

              {/* Specialization dropdown */}
              <label className="form-label">
                Specialization
                <select
                  name="specialization"
                  className="form-select"
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Specialization</option>
                  <option value="Criminal Law">Criminal Law</option>
                  <option value="Civil Law">Civil Law</option>
                  <option value="Family Law">Family Law</option>
                  <option value="Corporate Law">Corporate Law</option>
                  <option value="Property Law">Property Law</option>
                  <option value="Labor Law">Labor Law</option>
                  <option value="Tax Law">Tax Law</option>
                  <option value="Intellectual Property Law">
                    Intellectual Property Law
                  </option>
                  <option value="Environmental Law">Environmental Law</option>
                  <option value="Human Rights Law">Human Rights Law</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <input
                type="number"
                name="experience_years"
                placeholder="Experience (years)"
                className="form-input"
                value={formData.experience_years}
                onChange={handleChange}
                required
              />

              <input
                name="bar_council_id"
                placeholder="Bar Council ID"
                className="form-input"
                value={formData.bar_council_id}
                onChange={handleChange}
                required
              />

              <input
                name="bar_council_state"
                placeholder="Bar Council State"
                className="form-input"
                value={formData.bar_council_state}
                onChange={handleChange}
                required
              />
            </>
          )}

          <button type="submit" className="login-btn">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginSignup;
