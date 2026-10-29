import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const pretty = (value) => value ? String(value).replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "Unknown";
const date = (value) => value ? new Date(value).toLocaleString() : "—";

export default function IncidentTable({ incidents }) {
  return <div className="table-scroll"><table><thead><tr><th>Incident</th><th>Severity</th><th>Status</th><th>Root service</th><th>Detected</th><th /></tr></thead><tbody>{incidents.map((incident) => <tr key={incident.id}><td><Link className="incident-title" to={`/incidents/${incident.id}`}>{incident.title || incident.incidentKey || `Incident ${incident.id}`}</Link><small>{incident.incidentKey || `#${incident.id}`}</small></td><td><span className={`severity severity-${String(incident.severity || "").toLowerCase()}`}>{pretty(incident.severity)}</span></td><td>{pretty(incident.status)}</td><td>{incident.rootService || "—"}</td><td className="muted">{date(incident.detectedAt)}</td><td><Link className="row-link" to={`/incidents/${incident.id}`} aria-label="Open incident"><ArrowUpRight size={17} /></Link></td></tr>)}</tbody></table></div>;
}
