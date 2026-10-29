import { NavLink } from "react-router-dom";
import { Activity, AlertTriangle, LayoutDashboard, Radio, Sparkles } from "lucide-react";

const links = [
  ["Overview", "/", LayoutDashboard],
  ["Incidents", "/incidents", AlertTriangle],
  ["Telemetry", "/telemetry", Radio],
  ["AI analysis", "/analysis", Sparkles],
];

export default function Sidebar() {
  return <aside className="sidebar">
    <div className="brand"><span className="brand-icon"><Activity size={21} /></span><span><b>RootCause<span className="accent"> AI</span></b><small>Incident investigator</small></span></div>
    <div className="nav-label">Workspace</div>
    <nav>{links.map(([label, to, Icon]) => <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
    <div className="sidebar-foot"><span className="status-dot" /> Gateway API integration</div>
  </aside>;
}
