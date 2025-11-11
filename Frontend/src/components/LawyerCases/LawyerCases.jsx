import React, { useEffect, useState } from "react";
import "./LawyerCasesStyles.css";

function LawyerCases({ setSelectedCase }) {
  const [cases, setCases] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchCases = async () => {
      try {
        const res = await fetch("http://localhost:5000/lawyer/my-cases", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.success) setCases(data.cases);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCases();
  }, [token]);

  return (
    <div className="lawyer-my-cases-container">
      <h2>My Cases</h2>
      {cases.length === 0 ? (
        <p>No cases assigned to you yet.</p>
      ) : (
        <ul className="cases-list">
          {cases.map((c) => (
            <li
              key={c._id}
              onClick={() => setSelectedCase(c._id)}
              className="case-card"
            >
              <strong>{c.title}</strong> <span className={`status ${c.status}`}>{c.status== "ongoing"? "Pending": c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span>
              <p>Client: {c.client_name}</p>
              <p>Location: {c.location}</p>
              <p>Last Updated: {new Date(c.last_updated || c.updated_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LawyerCases;
