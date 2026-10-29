import { useEffect, useState } from "react";
import { Activity, AlertTriangle, ArrowRight, Radio, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { EmptyState, ErrorState, Loading } from "../../components/DataState";
import IncidentTable from "../../components/IncidentTable";

export default function Dashboard() {
  const [data, setData] = useState({ loading: true, incidents: null, telemetry: null, error: null });
  const load = () => { setData((current) => ({ ...current, loading: true, error: null })); Promise.all([api.incidents(0, 5), api.telemetry(0, 5)]).then(([incidents, telemetry]) => setData({ loading: false, incidents, telemetry, error: null })).catch((error) => setData({ loading: false, incidents: null, telemetry: null, error })); };
  useEffect(() => { Promise.all([api.incidents(0, 5), api.telemetry(0, 5)]).then(([incidents, telemetry]) => setData({ loading: false, incidents, telemetry, error: null })).catch((error) => setData({ loading: false, incidents: null, telemetry: null, error })); }, []);
  if (data.loading) return <Loading label="Loading production overview" />;
  if (data.error) return <ErrorState error={data.error} onRetry={load} />;
  const items = data.incidents?.content || [];
  const events = data.telemetry?.content || [];
  const cards = [[AlertTriangle, "Incidents returned", data.incidents?.totalElements ?? items.length], [Radio, "Telemetry events", data.telemetry?.totalElements ?? events.length], [Activity, "Open incidents in page", items.filter((incident) => !["RESOLVED", "CLOSED"].includes(incident.status)).length], [Sparkles, "AI analyses", "—"]];
  return <div className="page-stack">
    <section className="welcome-row"><div><div className="eyebrow">LIVE OPERATIONAL SIGNAL</div><h2>Production overview</h2><p>Incident and telemetry data from your connected services.</p></div><Link className="button button-primary" to="/analysis"><Sparkles size={16} /> Analyze an issue</Link></section>
    <div className="stats-grid">{cards.map(([Icon, label, value]) => <article className="stat-card" key={label}><span className="stat-icon"><Icon size={18} /></span><span className="stat-label">{label}</span><strong>{value}</strong><small>{label === "AI analyses" ? "Run an analysis from an incident signal" : "From the latest API page"}</small></article>)}</div>
    <section className="panel"><div className="panel-heading"><div><h3>Recent incidents</h3><p>Latest incidents reported by the correlation service</p></div><Link className="inline-link" to="/incidents">All incidents <ArrowRight size={15} /></Link></div>{items.length ? <IncidentTable incidents={items} /> : <EmptyState title="No incidents returned" detail="The incident service returned an empty page." />}</section>
    <section className="panel"><div className="panel-heading"><div><h3>Recent telemetry</h3><p>Latest events received by the telemetry service</p></div><Link className="inline-link" to="/telemetry">Browse events <ArrowRight size={15} /></Link></div>{events.length ? <div className="table-scroll"><table><thead><tr><th>Service</th><th>Type</th><th>Severity</th><th>Message</th><th>Event time</th></tr></thead><tbody>{events.map((e) => <tr key={e.id}><td>{e.serviceName}</td><td>{e.eventType}</td><td><span className={`severity severity-${String(e.severity || "").toLowerCase()}`}>{e.severity}</span></td><td className="message-cell">{e.message}</td><td className="muted">{e.eventTimestamp ? new Date(e.eventTimestamp).toLocaleString() : "—"}</td></tr>)}</tbody></table></div> : <EmptyState title="No telemetry returned" detail="The telemetry search returned an empty page." />}</section>
  </div>;
}
