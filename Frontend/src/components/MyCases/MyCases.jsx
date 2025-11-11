import React, { useEffect, useState } from "react";
import "./MyCasesStyles.css";

function MyCases({ setSelectedCase }) {
  const [cases, setCases] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchCases = async () => {
      try {
        const res = await fetch("http://localhost:5000/people/my-cases", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Unauthorized or failed to fetch cases");

        const data = await res.json();
        if (data.success) {
          setCases(data.cases);
        } else {
          console.error(data.message);
        }
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchCases();
  }, [token]);

  return (
    <div className="my-cases-container">
      <h2 className="my-cases-title">My Cases</h2>
      {cases.length === 0 ? (
        <p className="no-cases">No cases found.</p>
      ) : (
        <div className="case-grid">
          {cases.map((c) => (
            <div
              key={c._id}
              className="case-card"
              onClick={() => setSelectedCase(c._id)}
            >
              <h3 className="case-title">{c.title}</h3>
              <p className="case-status">
                <b>Status:</b>{" "}
                <span
                  className={
                    c.status === "open"
                      ? "status-open"
                      : c.status === "closed"
                      ? "status-closed"
                      : "status-pending"
                  }
                >
                  {(c.status === "ongoing") ? "Pending" : c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                </span>
              </p>
              <p><b>Lawyer:</b> {c.lawyer_name || "Not assigned"}</p>
              <p><b>Specialization:</b> {c.specialization}</p>
              <p><b>Location:</b> {c.location}</p>
              <p><b>Experience:</b> {c.experience_years} years</p>

              <button className="view-details-btn">
                View Details →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCases;
