import React, { useEffect, useState } from "react";
import "./CaseDetailsStyles.css";

function CaseDetails({ caseId, goBack }) {
  const [caseData, setCaseData] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`http://localhost:5000/people/${caseId}/clients`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setCaseData(data.caseData);
      })
      .catch(err => console.error(err));
  }, [caseId, token]);

  if (!caseData) return <p>Loading...</p>;

  return (
    <div className="case-details-container">
      <button className="back-button" onClick={goBack}>
        ← Back
      </button>

      <h2>{caseData.title}</h2>
      <p><strong>Description:</strong> {caseData.description}</p>
      <p><strong>Status:</strong> {caseData.status}</p>
      <p><strong>Category:</strong> {caseData.legal_category}</p>

      <h3>Process Updates:</h3>
      {caseData.process_updates.length === 0 ? (
        <p>No updates yet.</p>
      ) : (
        <ul>
          {caseData.process_updates.map((update, idx) => (
            <li key={idx}>
              {update.update_text} - <em>{new Date(update.timestamp).toLocaleString()}</em>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CaseDetails;
