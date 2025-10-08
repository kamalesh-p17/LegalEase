import React, { useState } from "react";
import "./LawyerSearchStyles.css";

function LawyerSearch({goBack}) {
  const [formData, setFormData] = useState({
    specialization: "",
    location: "",
    experience_years: "",
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // Handle input changes for search form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle lawyer search
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Please login to search for lawyers.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/people/filter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setResults(data.lawyers);
      } else {
        setResults([]);
        alert("No lawyers found or filter failed.");
      }
    } catch (err) {
      console.error("Error fetching lawyers:", err);
      alert("Error searching lawyers. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Send a request to the selected lawyer
  const handleSendRequest = async (lawyer) => {
    if (!token) {
      alert("Please login to send a request.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/people/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lawyer_id: lawyer._id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Request sent successfully to ${lawyer.user_id.name}!`);
      } else {
        alert("Failed to send request: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error sending request. Try again later.");
    }
  };

  return (
    <div className="lawyer-search-container">
      <button className="back-button" onClick={goBack}>
        ← Back
      </button>
      <h2>Search Lawyers</h2>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="lawyer-search-form">
        <input
          className="lawyer-search-input"
          name="specialization"
          placeholder="Specialization (e.g., Criminal, Civil)"
          value={formData.specialization}
          onChange={handleChange}
        />
        <input
          className="lawyer-search-input"
          name="location"
          placeholder="Location (e.g., Chennai)"
          value={formData.location}
          onChange={handleChange}
        />
        <input
          className="lawyer-search-input"
          name="experience_years"
          type="number"
          placeholder="Min Experience (years)"
          value={formData.experience_years}
          onChange={handleChange}
        />
        <button className="lawyer-search-button" type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Search Results */}
      <div className="lawyer-search-results">
        {results.length === 0 && !loading ? (
          <p>No lawyers found. Try adjusting filters.</p>
        ) : (
          <ul>
            {results.map((lawyer) => (
              <li
                key={lawyer._id}
                className="lawyer-item"
                style={{
                  padding: "15px",
                  borderBottom: "1px solid #ccc",
                  marginBottom: "10px",
                }}
              >
                <strong style={{ fontSize: "1.1rem" }}>
                  {lawyer.user_id?.name || "Unnamed Lawyer"}
                </strong>{" "}
                <br />
                <b>Specialization:</b> {lawyer.specialization} <br />
                <b>Location:</b> {lawyer.location} <br />
                <b>Experience:</b> {lawyer.experience_years} years <br />
                <b>Status:</b> {lawyer.approved_status} <br />
                <button
                  className="request-button"
                  onClick={() => handleSendRequest(lawyer)}
                  style={{
                    marginTop: "10px",
                    padding: "6px 12px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Send Request
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default LawyerSearch;
