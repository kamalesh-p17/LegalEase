import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/navbar/navbar.jsx";
import LoginSignup from "./pages/loginsignup.jsx";
import CommonDashboard from "./pages/commonDashboard.jsx";
import LawyerDashboard from "./pages/lawyerDashboard.jsx";
import LawyerNotifications from "./components/LawyerNotification/LawyerNotification.jsx";
import Home from "./pages/Home.jsx";
import Footer from "./components/Footer/Footer.jsx";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <Router>
      {/* ✅ Navbar always visible */}
      <Navbar isLoggedIn={!!token} userRole={role} />

      <Routes>
        <Route path="/" element={<Home />} />
        {/* 🔐 Login/Signup */}
        <Route path="/login" element={<LoginSignup />} />
        
        {/* 👤 Common User Dashboard */}
        <Route
          path="/dashboard"
          element={
            !token || role !== "common" ? (
              <Navigate to="/" />
            ) : (
              <CommonDashboard />
            )
          }
        />

        {/* ⚖️ Lawyer Dashboard */}
        <Route
          path="/lawyer-dashboard"
          element={
            !token || role !== "lawyer" ? (
              <Navigate to="/" />
            ) : (
              <LawyerDashboard />
            )
          }
        />

        {/* 📨 Lawyer Notifications Page */}
        <Route
          path="/lawyer-notifications"
          element={
            !token || role !== "lawyer" ? (
              <Navigate to="/" />
            ) : (
              <LawyerNotifications />
            )
          }
        />

        {/* 🚫 Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer/>
    </Router>
  );
}

export default App;
