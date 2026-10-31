import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import { api, errorMessage } from "../services/api";

const title = (path) => path === "/" ? "Overview" : path.startsWith("/incidents/") ? "Incident details" : ({ "/incidents": "Incidents", "/telemetry": "Telemetry events", "/analysis": "AI root cause analysis" }[path] || "RootCause AI");

export default function Navbar({ username, onLogout }) {
  const location = useLocation(); const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false); const [logoutError, setLogoutError] = useState("");
  const initials = (username || "U").slice(0, 2).toUpperCase();
  const logout = async () => {
    setLoggingOut(true); setLogoutError("");
    try {
      await api.logout();
      onLogout();
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(errorMessage(error));
    } finally {
      setLoggingOut(false);
    }
  };
  return <header className="topbar"><div><div className="eyebrow">PRODUCTION OBSERVABILITY</div><h1>{title(location.pathname)}</h1></div><div className="topbar-actions"><span className="environment-pill"><i /> Production</span><button className="icon-button" aria-label="Notifications"><Bell size={18} /></button><button className="profile-button" onClick={logout} disabled={loggingOut} title="Sign out"><span className="avatar">{initials}</span><span className="profile-name">{loggingOut ? "Signing out…" : username || "Signed in"}</span><LogOut size={15} /></button>{logoutError && <span className="form-error" role="alert">{logoutError}</span>}</div></header>;
}
