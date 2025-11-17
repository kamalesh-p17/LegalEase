import React, { useState } from "react";
import "./LawyerSearchStyles.css";

function LawyerSearch({ goBack }) {
  const [formData, setFormData] = useState({
    specialization: "",
    location: "",
    experience_years: "",
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
        alert("No lawyers found.");
      }
    } catch (err) {
      alert("Error fetching lawyers.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (lawyer) => {
    if (!token) return alert("Please login first.");

    try {
      const res = await fetch("http://localhost:5000/people/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lawyer_id: lawyer._id }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Request sent to ${lawyer.user_id?.name}!`);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error sending request.");
    }
  };

  return (
    <div className="lawyer-search-container">

      <button className="back-button" onClick={goBack}>
        ← Back
      </button>

      <h2 className="search-heading">Find the Lawyer</h2>
      <p className="search-subtext">Search using filters below</p>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="lawyer-search-form">

        <select
          name="specialization"
          value={formData.specialization}
          onChange={handleChange}
          className="lawyer-search-input"
        >
          <option value="">Select Specialization</option>
          <option value="criminal">Criminal</option>
          <option value="civil">Civil</option>
          <option value="family">Family</option>
          <option value="corporate">Corporate</option>
          <option value="property">Property</option>
          <option value="labor">Labor</option>
          <option value="tax">Tax</option>
          <option value="intellectual_property">Intellectual Property</option>
          <option value="environmental">Environmental</option>
          <option value="human_rights">Human Rights</option>
          <option value="others">Others</option>
        </select>

        <input
          className="lawyer-search-input"
          name="location"
          placeholder="Location"
          onChange={handleChange}
        />
        <input
          className="lawyer-search-input"
          name="experience_years"
          type="number"
          placeholder="Min Experience"
          onChange={handleChange}
        />

        <button className="lawyer-search-button" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Results */}
      <div className="lawyer-results">
        {results.length === 0 && !loading ? (
          <p className="no-results">No lawyers found.</p>
        ) : (
          results.map((lawyer) => (
            <div className="lawyer-row-card" key={lawyer._id}>

              {/* LEFT — Lawyer Details */}
              <div className="lawyer-info">
                <h3 className="lawyer-name">{lawyer.user_id?.name}</h3>
                <p><b>Specialization:</b> {lawyer.specialization}</p>
                <p><b>Location:</b> {lawyer.location}</p>
                <p><b>Experience:</b> {lawyer.experience_years} years</p>

                <button
                  className="request-button"
                  onClick={() => handleSendRequest(lawyer)}
                >
                  Send Request
                </button>
              </div>

              {/* RIGHT — Case Count in ONE Horizontal Row */}
              <div className="lawyer-stats-horizontal">
                <div className="hstat">
                  <span className="hstat-count ongoing">{lawyer.ongoingCount}</span>
                  <span className="hstat-label">Ongoing</span>
                </div>

                <div className="hstat">
                  <span className="hstat-count completed">{lawyer.completedCount}</span>
                  <span className="hstat-label">Completed</span>
                </div>

                <div className="hstat">
                  <span className="hstat-count closed">{lawyer.closedCount}</span>
                  <span className="hstat-label">Closed</span>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LawyerSearch;
