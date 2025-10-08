import React, { useEffect, useState } from "react";

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
    <div>
      <h2>My Cases</h2>
      {cases.length === 0 ? (
        <p>No cases found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {cases.map((c) => (
            <li
              key={c._id}
              onClick={() => setSelectedCase(c._id)}
              style={{
                cursor: "pointer",
                padding: "10px",
                border: "1px solid #ccc",
                marginBottom: "10px",
                borderRadius: "5px",
                background: "#f9f9f9",
              }}
            >
              <strong>{c.title}</strong> - {c.status} <br />
              Lawyer: {c.lawyer_name} ({c.specialization}) <br />
              Location: {c.location} | Experience: {c.experience_years} years
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyCases;
