import React, { useState, useEffect } from "react";
import MyCases from "../components/MyCases/MyCases.jsx";
import CaseDetails from "../components/CaseDetails/CaseDetails.jsx";
import LawyerSearch from "../components/LawyerSearch/LawyerSearch.jsx";
// import DocumentSummarizer from "./DocumentSummarizer";
import "./CommonDashboardStyles.css";

function CommonDashboard() {
  console.log("Rendering CommonDashboard");
  const [selectedCase, setSelectedCase] = useState(null);
  const [view, setView] = useState("cases"); // "cases", "search", "summarizer"

  return (
    <div className="common-dashboard-container">
      <main className="common-dashboard-main">
        {(!selectedCase && view === "cases") && <MyCases setSelectedCase={setSelectedCase} />}
        {selectedCase && <CaseDetails caseId={selectedCase} goBack={() => setSelectedCase(null)} />}
        {view === "search" && <LawyerSearch goBack={() => setView("cases")}/>}
        {/* {view === "summarizer" && <DocumentSummarizer />} */}
      </main>

      {/* Floating action buttons */}
      {!selectedCase && (
        <div className="common-dashboard-actions">
          <button onClick={() => setView("search")}>Search Lawyer</button>
          <button onClick={() => setView("summarizer")}>Document Summarizer</button>
        </div>
      )}
    </div>
  );
}

export default CommonDashboard;
