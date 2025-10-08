// LawyerDashboard.jsx
import React, { useState } from "react";
import LawyerNotifications from "../components/LawyerNotification/LawyerNotification.jsx";

function LawyerDashboard() {
  const [viewRequests, setViewRequests] = useState(false);

  return (
    <div style={{ padding: "20px" }}>
      {!viewRequests ? (
        <button
          onClick={() => setViewRequests(true)}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            borderRadius: "5px",
            background: "#007bff",
            color: "#fff",
            border: "none",
          }}
        >
          View Requests
        </button>
      ) : (
        <LawyerNotifications goBack={() => setViewRequests(false)} />
      )}
    </div>
  );
}

export default LawyerDashboard;
