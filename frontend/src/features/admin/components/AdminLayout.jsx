import { NavLink, Outlet } from "react-router-dom";

const navLinkBase =
  "flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm";

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex md:flex-col">
        <div className="h-16 flex items-center px-4 border-b border-gray-200">
          <span className="text-lg font-semibold text-blue-700">MediNet Admin</span>
        </div>
        <nav className="p-4 space-y-1">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`
            }
          >
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`
            }
          >
            <span>Usuarios</span>
          </NavLink>
          <NavLink
            to="/admin/doctors"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`
            }
          >
            <span>Médicos</span>
          </NavLink>
          <NavLink
            to="/admin/patients"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`
            }
          >
            <span>Pacientes</span>
          </NavLink>
          <NavLink
            to="/admin/appointments"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`
            }
          >
            <span>Citas</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <h1 className="text-base md:text-lg font-semibold text-gray-800">Panel de administración</h1>
        </header>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;


