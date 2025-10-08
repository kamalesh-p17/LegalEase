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
        setRequests(requests.filter(r => r.client_id !== selectedRequest.client_id));
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
      <button className="back-button" onClick={goBack}>← Back</button>
      <h2>Client Requests</h2>

      {selectedRequest ? (
        <div className="case-form-modal">
          <h3>Create Case for {selectedRequest.client_name}</h3>
          <input
            type="text"
            placeholder="Case Title"
            value={caseData.title}
            onChange={(e) => setCaseData({ ...caseData, title: e.target.value })}
          />
          <textarea
            placeholder="Case Description"
            value={caseData.description}
            onChange={(e) => setCaseData({ ...caseData, description: e.target.value })}
          />
          <input
            type="text"
            placeholder="Legal Category"
            value={caseData.legal_category}
            onChange={(e) => setCaseData({ ...caseData, legal_category: e.target.value })}
          />
          <div className="case-buttons">
            <button className="accept-btn" onClick={handleSubmitCase}>
              Accept & Create Case
            </button>
            <button className="cancel-btn" onClick={() => setSelectedRequest(null)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <ul className="requests-list">
          {requests.length === 0 ? (
            <p className="no-requests">No pending requests.</p>
          ) : (
            requests.map((req) => (
              <li key={req.client_id} className="request-item">
                <div>
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
                    onClick={() => {
                      // Optional: implement reject functionality
                      setRequests(requests.filter(r => r.client_id !== req.client_id));
                    }}
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
