import React, { useState } from "react";
import "./loginsignupStyles.css";

function LoginSignup() {
  const API_BASE_URL = "http://localhost:5000"; // backend base URL
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("common");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    specialization: "",
    experience_years: "",
    bar_council_id: "",
    bar_council_state: "",
    ratings: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let res, data;

      if (isLogin) {
        // ---- LOGIN ----
        res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });
        data = await res.json();

        if (!res.ok) throw new Error(data.message || "Login failed");

        // ✅ Store token, role, and username
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("username", data.user.name);

        alert(`Login successful: ${data.user.name}`);

      } else {
        // ---- REGISTER ----
        res = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, role }),
        });
        data = await res.json();

        if (!res.ok) throw new Error(data.message || "Registration failed");

        // ✅ Store token, role, and username
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("username", data.user.name);

        alert(`Registration successful: ${data.user.name}`);
      }

      // Redirect user based on role (optional)
      const userRole = data.user.role;
      if (userRole === "common") window.location.href = "/common-dashboard";
      else if (userRole === "lawyer") window.location.href = "/lawyer-dashboard";
      else window.location.href = "/";

    } catch (err) {
      alert(err.message);
    }

    // Reset form
    setFormData({
      name: "",
      email: "",
      password: "",
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
    <div className="login-signup-container">
      <form className="login-signup-form" onSubmit={handleSubmit}>
        <h2>{isLogin ? "Login" : "Register"}</h2>

        {!isLogin && (
          <>
            <label>
              Role:
              <select
                className="login-signup-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="common">Common User</option>
                <option value="lawyer">Lawyer</option>
                <option value="student">Student</option>
              </select>
            </label>

            <input
              className="login-signup-input"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              className="login-signup-input"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </>
        )}

        <input
          className="login-signup-input"
          name="email"
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          className="login-signup-input"
          name="password"
          placeholder="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {!isLogin && role === "common" && (
          <input
            className="login-signup-input"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        )}

        {!isLogin && role === "lawyer" && (
          <>
            <input
              className="login-signup-input"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              required
            />
            <input
              className="login-signup-input"
              name="specialization"
              placeholder="Specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
            />
            <input
              className="login-signup-input"
              name="experience_years"
              placeholder="Experience (years)"
              type="number"
              value={formData.experience_years}
              onChange={handleChange}
              required
            />
            <input
              className="login-signup-input"
              name="bar_council_id"
              placeholder="Bar Council ID"
              value={formData.bar_council_id}
              onChange={handleChange}
              required
            />
            <input
              className="login-signup-input"
              name="bar_council_state"
              placeholder="Bar Council State"
              value={formData.bar_council_state}
              onChange={handleChange}
              required
            />
            <input
              className="login-signup-input"
              name="ratings"
              placeholder="Initial Ratings (0-5)"
              type="number"
              step="0.1"
              value={formData.ratings}
              onChange={handleChange}
            />
          </>
        )}

        <button className="login-signup-button" type="submit">
          {isLogin ? "Login" : "Register"}
        </button>

        <p className="login-signup-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span
            style={{
              cursor: "pointer",
              textDecoration: "underline",
              marginLeft: "5px",
            }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </form>
    </div>
  );
}

export default LoginSignup;
