import { Routes, Route } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import ElectionManagement from "./ElectionManagement";
import CandidateManagement from "./CandidateManagement";
import ElectionResults from "./ElectionResults";
import ElectionDetails from "./ElectionDetails";
import BlockchainReports from "./BlockchainReports";

function AdminDashboard() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route path="elections" element={<ElectionManagement />} />
        <Route path="elections/:electionId" element={<ElectionDetails />} />
        <Route path="candidates" element={<CandidateManagement />} />
        <Route path="results/:electionId" element={<ElectionResults />} />
        <Route path="reports" element={<BlockchainReports />} />
      </Route>
    </Routes>
  );
}

export default AdminDashboard;
