import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/investments", label: "Investments" },
  { to: "/admin/hero", label: "Hero Section" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-10">Admin Panel</h1>

      <nav className="space-y-3">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${
                isActive ? "bg-emerald-600" : "hover:bg-gray-800"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
