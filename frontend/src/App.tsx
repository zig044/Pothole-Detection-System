import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import ReportPothole from "./pages/ReportPothole";
import Reports from "./pages/Reports";
import ReportDetails from "./pages/ReportDetails";
import Map from "./pages/Map";
import Maintenance from "./pages/Maintenance";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/report" element={<ReportPothole />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:id" element={<ReportDetails />} />
          <Route path="/map" element={<Map />} />
          <Route path="/maintenance" element={<Maintenance />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;