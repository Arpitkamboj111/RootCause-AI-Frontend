import { Outlet } from "react-router-dom";
import Sidebar from "../../components/SideBar.jsx";
import Navbar from "../../components/Navbar.jsx";

export default function DashboardLayout({ username, onLogout }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-shell">
        <Navbar username={username} onLogout={onLogout} />
        <main className="page-content">
          <div className="content-width">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
