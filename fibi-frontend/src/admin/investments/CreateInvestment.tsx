import AdminLayout from "../AdminLayout";
import InvestmentForm from "./InvestmentForm";

export default function CreateInvestment() {
  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-6">Add Investment</h2>
      <InvestmentForm submitLabel="Create Investment" />
    </AdminLayout>
  );
}
