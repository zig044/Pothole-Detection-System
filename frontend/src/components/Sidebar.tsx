import {
  LayoutDashboard,
  Camera,
  FileText,
  Map,
  Wrench,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-950 text-white p-5">

      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-xl font-bold">
          Pothole System
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          Road Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">

        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive
                ? "bg-slate-800"
                : "hover:bg-slate-800"
            }`
          }
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/report"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive
                ? "bg-slate-800"
                : "hover:bg-slate-800"
            }`
          }
        >
          <Camera size={20} />
          Report Pothole
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive
                ? "bg-slate-800"
                : "hover:bg-slate-800"
            }`
          }
        >
          <FileText size={20} />
          Reports
        </NavLink>

        <NavLink
          to="/map"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive
                ? "bg-slate-800"
                : "hover:bg-slate-800"
            }`
          }
        >
          <Map size={20} />
          Map
        </NavLink>

        <NavLink
          to="/maintenance"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              isActive
                ? "bg-slate-800"
                : "hover:bg-slate-800"
            }`
          }
        >
          <Wrench size={20} />
          Maintenance
        </NavLink>

      </nav>
    </aside>
  );
}

export default Sidebar;