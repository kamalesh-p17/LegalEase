import React, { useState } from "react";
import './LawyerSearchStyles.css';

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
        alert("No lawyers found or filter failed.");
      }
    } catch (err) {
      console.error("Error fetching lawyers:", err);
      alert("Error searching lawyers. Try again later.");
    } finally {
      setLoading(false);
    }
  };

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

      <h2 className="search-heading">Find the Lawyer</h2>
      <p className="search-subtext">
        Filter lawyers based on specialization, location, or years of experience.
      </p>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="lawyer-search-form">

        {/* Specialization Dropdown */}
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

      {/* Results */}
      <div className="lawyer-results">
        {results.length === 0 && !loading ? (
          <p className="no-results">No lawyers found. Try adjusting filters.</p>
        ) : (
          <div className="lawyer-grid">
            {results.map((lawyer) => (
              <div className="lawyer-card" key={lawyer._id}>
                <h3 className="lawyer-name">{lawyer.user_id?.name || "Unnamed Lawyer"}</h3>
                <p><b>Specialization:</b> {lawyer.specialization}</p>
                <p><b>Location:</b> {lawyer.location}</p>
                <p><b>Experience:</b> {lawyer.experience_years} years</p>
                <p><b>Status:</b> {lawyer.approved_status}</p>

                <button
                  className="request-button"
                  onClick={() => handleSendRequest(lawyer)}
                >
                  Send Request
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LawyerSearch;
