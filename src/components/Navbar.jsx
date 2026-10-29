import { useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import { clearToken } from "../services/api";

const title = (path) => path === "/" ? "Overview" : path.startsWith("/incidents/") ? "Incident details" : ({ "/incidents": "Incidents", "/telemetry": "Telemetry events", "/analysis": "AI root cause analysis" }[path] || "RootCause AI");

export default function Navbar({ onLogout, username }) {
  const location = useLocation(); const navigate = useNavigate();
  const logout = () => { clearToken(); onLogout(); navigate("/login", { replace: true }); };
  const initials = (username || "U").slice(0, 2).toUpperCase();
  return <header className="topbar"><div><div className="eyebrow">PRODUCTION OBSERVABILITY</div><h1>{title(location.pathname)}</h1></div><div className="topbar-actions"><span className="environment-pill"><i /> Production</span><button className="icon-button" aria-label="Notifications"><Bell size={18} /></button><button className="profile-button" onClick={logout} title="Sign out"><span className="avatar">{initials}</span><span className="profile-name">{username || "Signed in"}</span><LogOut size={15} /></button></div></header>;
}
