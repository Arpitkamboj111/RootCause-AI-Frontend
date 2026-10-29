import { Outlet } from "react-router-dom";
import Sidebar from "../../components/SideBar.jsx";
import Navbar from "../../components/Navbar.jsx";

export default function DashboardLayout({ onLogout, username }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-shell">
        <Navbar onLogout={onLogout} username={username} />
        <main className="page-content">
          <div className="content-width">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
