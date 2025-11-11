import React, { useEffect, useState } from "react";
import "./CaseDetailsStyles.css";

function CaseDetails({ caseId, goBack }) {
  const [caseData, setCaseData] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`http://localhost:5000/people/${caseId}/clients`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCaseData(data.caseData);
      })
      .catch((err) => console.error(err));
  }, [caseId, token]);

  if (!caseData) return <p className="loading-text">Loading case details...</p>;

  // Helper to format status nicely
  const formatStatus = (status) => {
    if (status === "ongoing") return "Pending";
    if (status === "completed") return "Completed";
    if (status === "closed") return "Closed";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="case-details-container">
      <button className="back-button" onClick={goBack}>
        ← Back
      </button>

      <div className="case-card">
        <h2 className="case-title">{caseData.title}</h2>

        <p className="case-description">
          <strong>Description:</strong> {caseData.description || "No description provided."}
        </p>

        <div className="case-meta">
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={
                caseData.status === "ongoing"
                  ? "status-pending"
                  : caseData.status === "completed"
                  ? "status-completed"
                  : "status-closed"
              }
            >
              {formatStatus(caseData.status)}
            </span>
          </p>
          <p>
            <strong>Category:</strong> {caseData.legal_category || "N/A"}
          </p>
        </div>
      </div>

      <div className="updates-section">
        <h3>Process Updates</h3>
        {caseData.process_updates.length === 0 ? (
          <p className="no-updates">No updates available yet.</p>
        ) : (
          <ul className="updates-list">
            {caseData.process_updates.map((update, idx) => (
              <li key={idx} className="update-item">
                <p className="update-text">{update.update_text}</p>
                <span className="update-time">
                  {new Date(update.timestamp).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CaseDetails;
