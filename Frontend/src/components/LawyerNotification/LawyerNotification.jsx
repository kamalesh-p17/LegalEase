import React, { useEffect, useState } from "react";
import "./LawyerNotificationStyles.css";

function LawyerNotifications({ goBack }) {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [caseData, setCaseData] = useState({
    title: "",
    description: "",
    legal_category: "",
  });

  const token = localStorage.getItem("token");

  // Fetch lawyer requests from backend
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch("http://localhost:5000/lawyer/requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log(data);
        if (data.success) setRequests(data.requests || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRequests();
  }, [token]);

  // Handle Accept (opens case form)
  const handleAcceptClick = (request) => {
    setSelectedRequest(request);
  };

  // Submit case form to backend
  const handleSubmitCase = async () => {
    if (!caseData.title || !caseData.description || !caseData.legal_category) {
      alert("All fields are required");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/case/requests/${selectedRequest.client_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(caseData),
        }
      );

      const data = await res.json();
      if (data.success) {
        alert("Case created successfully!");
        setRequests(
          requests.filter((r) => r.client_id !== selectedRequest.client_id)
        );
        setSelectedRequest(null);
        setCaseData({ title: "", description: "", legal_category: "" });
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error creating case");
    }
  };

  return (
    <div className="notifications-container">
      <button className="back-button" onClick={goBack}>
        ← Back
      </button>

      <h2 className="notifications-title">Client Requests</h2>

      {/* CASE CREATION FORM */}
      {selectedRequest ? (
        <div className="case-form-modal">
          <h3 className="modal-title">
            Create Case for <span>{selectedRequest.client_name}</span>
          </h3>

          <input
            type="text"
            placeholder="Case Title"
            value={caseData.title}
            onChange={(e) =>
              setCaseData({ ...caseData, title: e.target.value })
            }
            className="case-input"
          />

          <textarea
            placeholder="Case Description"
            value={caseData.description}
            onChange={(e) =>
              setCaseData({ ...caseData, description: e.target.value })
            }
            className="case-textarea"
          />

          {/* 🔹 Dropdown for Legal Category */}
          <label className="form-label">
            Legal Category
            <select
              name="legal_category"
              value={caseData.legal_category}
              onChange={(e) =>
                setCaseData({ ...caseData, legal_category: e.target.value })
              }
              className="case-select"
              required
            >
              <option value="">Select Category</option>
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

          <div className="case-buttons">
            <button className="accept-btn" onClick={handleSubmitCase}>
              Accept & Create Case
            </button>
            <button
              className="cancel-btn"
              onClick={() => setSelectedRequest(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // 🔹 REQUESTS LIST
        <ul className="requests-list">
          {requests.length === 0 ? (
            <p className="no-requests">No pending client requests.</p>
          ) : (
            requests.map((req) => (
              <li key={req.client_id} className="request-item">
                <div className="request-info">
                  <strong>{req.client_name}</strong> sent a request.
                  <span className="request-time">
                    {new Date(req.requested_at).toLocaleString()}
                  </span>
                </div>

                <div className="request-actions">
                  <button
                    className="accept-button"
                    onClick={() => handleAcceptClick(req)}
                  >
                    Accept
                  </button>
                  <button
                    className="reject-button"
                    onClick={() =>
                      setRequests(
                        requests.filter((r) => r.client_id !== req.client_id)
                      )
                    }
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default LawyerNotifications;
