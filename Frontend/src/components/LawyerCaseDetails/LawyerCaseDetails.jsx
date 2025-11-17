import React, { useEffect, useState } from "react";
import "./LawyerCaseDetailsStyles.css";

function LawyerCaseDetails({ caseId, goBack }) {
  const [caseData, setCaseData] = useState(null);
  const [updateText, setUpdateText] = useState("");
  const [loading, setLoading] = useState(false);

  const [newStatus, setNewStatus] = useState(""); // ⭐ NEW
  const [statusLoading, setStatusLoading] = useState(false); // ⭐ NEW

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/lawyer/${caseId}/clients`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        if (data.success) setCaseData(data.caseData);
      } catch (err) {
        console.error("Error fetching case:", err);
      }
    };

    fetchCase();
  }, [caseId, token]);

  // ======================================================
  // ⭐ UPDATE PROCESS NOTES
  // ======================================================
  const handleProcessUpdate = async () => {
    if (!updateText.trim()) {
      alert("Please enter update details.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/lawyer/${caseId}/process_update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ updateText }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Process update added successfully!");
        setUpdateText("");

        setCaseData((prev) => ({
          ...prev,
          process_updates: [
            ...(prev.process_updates || []),
            { update_text: updateText, timestamp: new Date().toISOString() },
          ],
        }));
      } else {
        alert(data.message || "Failed to add update.");
      }
    } catch (err) {
      console.error("Error updating process:", err);
      alert("Server error while adding update.");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // ⭐ UPDATE CASE STATUS
  // ======================================================
  const handleStatusUpdate = async () => {
    if (!newStatus) {
      alert("Please select a status.");
      return;
    }

    setStatusLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5000/case/${caseId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ new_status: newStatus }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Case status updated!");
        setCaseData((prev) => ({ ...prev, status: newStatus }));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Server error");
    } finally {
      setStatusLoading(false);
    }
  };

  if (!caseData) return <p className="loading-text">Loading case details...</p>;

  return (
    <div className="lawyer-case-details-container">
      <button className="back-button" onClick={goBack}>
        ← Back
      </button>

      <div className="case-header">
        <h2 className="case-title">{caseData.title}</h2>
        <p className="case-meta">
          <strong>Status:</strong>{" "}
          {caseData.status === "ongoing"
            ? "Pending"
            : caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1)}
          {" | "}
          <strong>Category:</strong> {caseData.legal_category}
        </p>
      </div>

      <div className="case-section">
        <h3>Case Description</h3>
        <p className="case-description">{caseData.description}</p>
      </div>

      <div className="case-section client-info">
        <h3>Client Information</h3>
        <p><strong>Name:</strong> {caseData.client?.name}</p>
        <p><strong>Email:</strong> {caseData.client?.email}</p>
        <p><strong>Phone:</strong> {caseData.client?.phone}</p>
        <p><strong>Location:</strong> {caseData.client?.location}</p>
      </div>

      <div className="case-section">
        <h3>Process Updates</h3>

        {caseData.process_updates.length === 0 ? (
          <p className="no-updates">No updates yet.</p>
        ) : (
          <ul className="updates-list">
            {caseData.process_updates.map((update, idx) => (
              <li key={idx} className="update-item">
                <p>{update.update_text}</p>
                <small className="update-time">
                  {new Date(update.timestamp).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Update */}
      {caseData.status === "ongoing" && <div className="case-section process-update-section">
        <h3>Add Process Update</h3>
        <textarea
          value={updateText}
          onChange={(e) => setUpdateText(e.target.value)}
          placeholder="Enter progress notes or hearing update..."
          className="update-textarea"
        />
        <button
          className="submit-update-btn"
          onClick={handleProcessUpdate}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Add Update"}
        </button>
      </div>}

      {/* ⭐ NEW STATUS UPDATE SECTION */}
      {caseData.status === "ongoing" && <div className="case-section status-update-section">
        <h3>Update Case Status</h3>

        <select
          className="status-select"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
        >
          <option value="">Select Status</option>
          <option value="completed">Completed</option>
          <option value="closed">Closed</option>
        </select>

        <button
          className="submit-status-btn"
          onClick={handleStatusUpdate}
          disabled={statusLoading}
        >
          {statusLoading ? "Updating..." : "Update Status"}
        </button>
      </div>}
    </div>
  );
}

export default LawyerCaseDetails;
