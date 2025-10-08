import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/navbar/navbar.jsx";
import LoginSignup from "./pages/loginsignup.jsx";
import CommonDashboard from "./pages/commonDashboard.jsx";
import LawyerDashboard from "./pages/lawyerDashboard.jsx";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <Router>
      <Navbar isLoggedIn={!!token} userRole={role} />

      <Routes>
        {/* Login/Signup */}
        <Route path="/" element={<LoginSignup />} />

        {/* Common User Dashboard */}
        <Route
          path="/dashboard"
          element={
            !token || role !== "common" ? <Navigate to="/" /> : <CommonDashboard />
          }
        />

        {/* Lawyer Dashboard */}
        <Route
          path="/lawyer-dashboard"
          element={
            !token || role !== "lawyer" ? <Navigate to="/" /> : <LawyerDashboard />
          }
        />

        {/* Optional catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
