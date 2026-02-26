import AdminLayout from "../AdminLayout";

export default function Dashboard() {
  return (
    <AdminLayout>
      <h2 className="text-3xl font-bold mb-8">Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Active Investments" value="4" />
        <StatCard title="Total Investors" value="128" />
        <StatCard title="Funds Raised" value="KES 12.4M" />
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <p className="text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold mt-2">{value}</h3>
    </div>
  );
}
