import { Link } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import type { Investment } from "../components/types";

const investments: Investment[] = [
  {
    id: "1",
    title: "Avocado Farm",
    location: "Murang'a",
    description: "",
    pricePerUnit: 50000,
    roi: "18%",
    images: [],
    status: "open",
    createdAt: "",
  },
];

export default function InvestmentList() {
  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Investments</h2>

        <Link
          to="/admin/investments/create"
          className="bg-emerald-600 text-white px-5 py-2 rounded"
        >
          + Add Investment
        </Link>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Title</th>
              <th>Status</th>
              <th>ROI</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {investments.map(inv => (
              <tr key={inv.id} className="border-t">
                <td className="p-4">{inv.title}</td>
                <td className="capitalize">{inv.status}</td>
                <td>{inv.roi}</td>
                <td className="space-x-4">
                  <Link
                    to={`/admin/investments/edit/${inv.id}`}
                    className="text-blue-600"
                  >
                    Edit
                  </Link>
                  <button className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
