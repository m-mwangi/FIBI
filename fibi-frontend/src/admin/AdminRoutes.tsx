import { Routes, Route, Navigate } from "react-router-dom";
import InvestmentList from "./investments/InvestmentList";
import CreateInvestment from "./investments/CreateInvestment";
import EditInvestment from "./investments/EditInvestment";
import HeroAdmin from "./HeroAdmin";
import Dashboard from "./components/Dashboard";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="investments" element={<InvestmentList />} />
      <Route path="investments/create" element={<CreateInvestment />} />
      <Route path="investments/edit/:id" element={<EditInvestment />} />
      <Route path="hero" element={<HeroAdmin />} />
    </Routes>
  );
}
