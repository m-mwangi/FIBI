import AdminLayout from "../AdminLayout";
import { useParams } from "react-router-dom";
import InvestmentForm from "./InvestmentForm";

export default function EditInvestment() {
  const { id } = useParams();

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-6">Edit Investment #{id}</h2>
      <InvestmentForm submitLabel="Update Investment" />
    </AdminLayout>
  );
}
