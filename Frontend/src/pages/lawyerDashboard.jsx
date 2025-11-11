import React, { useState } from "react";
import LawyerCases from "../components/LawyerCases/LawyerCases.jsx";
import LawerCaseDetails from "../components/LawyerCaseDetails/LawyerCaseDetails.jsx";
import "./LawyerDashboardStyles.css";

function LawyerDashboard() {
  const [selectedCase, setSelectedCase] = useState(null);

  return (
    <div className="lawyer-dashboard-container">
      <h1 className="dashboard-title">Lawyer Dashboard</h1>
      {!selectedCase ? (
        <>
          <p className="dashboard-subtitle">
            View and manage your assigned cases
          </p>
          <LawyerCases setSelectedCase={setSelectedCase} />
        </>
      ) : (
        <LawerCaseDetails
          caseId={selectedCase}
          goBack={() => setSelectedCase(null)}
        />
      )}
    </div>
  );
}

export default LawyerDashboard;
