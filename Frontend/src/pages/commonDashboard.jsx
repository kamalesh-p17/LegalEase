import React, { useState } from "react";
import MyCases from "../components/MyCases/MyCases.jsx";
import CaseDetails from "../components/CaseDetails/CaseDetails.jsx";
import "./CommonDashboardStyles.css";

function CommonDashboard() {
  const [selectedCase, setSelectedCase] = useState(null);

  return (
    <div className="common-dashboard-container">
      <main className="common-dashboard-main">
        {/* Show case list or details */}
        {!selectedCase && <MyCases setSelectedCase={setSelectedCase} />}
        {selectedCase && (
          <CaseDetails
            caseId={selectedCase}
            goBack={() => setSelectedCase(null)}
          />
        )}
      </main>
    </div>
  );
}

export default CommonDashboard;
