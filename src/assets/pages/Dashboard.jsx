import { useEffect, useState } from "react";
import { Activity, AlertTriangle, ArrowRight, Radio, RefreshCw, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../../services/api";
import { EmptyState, Loading } from "../../components/DataState";
import IncidentTable from "../../components/IncidentTable";

const REFRESH_MS = Math.max(Number(import.meta.env.VITE_DASHBOARD_REFRESH_MS) || 30000, 5000);
const isAnalyzed = (analysis) => String(analysis.status || "").toUpperCase() === "ANALYZED";
const timestamp = (value) => value ? new Date(value).toLocaleString() : "—";

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = useState({ loading: true, incidents: null, telemetry: null, analyses: null, errors: {} });

  useEffect(() => {
    let active = true;
    let inFlight = false;
    const refresh = async () => {
      if (inFlight || document.hidden) return;
      inFlight = true;
      const results = await Promise.allSettled([
        api.allIncidents(),
        api.telemetry(0, 5),
        api.analyses(0, 5),
      ]);
      if (active) {
        const [incidents, telemetry, analyses] = results;
        setData({
          loading: false,
          incidents: incidents.status === "fulfilled" ? incidents.value : null,
          telemetry: telemetry.status === "fulfilled" ? telemetry.value : null,
          analyses: analyses.status === "fulfilled" ? analyses.value : null,
          errors: {
            incidents: incidents.status === "rejected" ? incidents.reason : null,
            telemetry: telemetry.status === "rejected" ? telemetry.reason : null,
            analyses: analyses.status === "rejected" ? analyses.reason : null,
          },
        });
      }
      inFlight = false;
    };
    refresh();
    const interval = window.setInterval(refresh, REFRESH_MS);
    return () => { active = false; window.clearInterval(interval); };
  }, [refreshKey]);

  if (data.loading) return <Loading label="Loading production overview" />;

  const incidentRows = data.incidents?.content || [];
  const incidentsByStatus = incidentRows.reduce((counts, incident) => {
    const status = incident.status || "UNKNOWN";
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
  const criticalHigh = incidentRows.filter((incident) => ["CRITICAL", "HIGH"].includes(String(incident.severity).toUpperCase())).length;
  const telemetryRows = data.telemetry?.content || [];
  const analysisRows = data.analyses?.content || [];
  const cards = [
    [Radio, "Total telemetry events", data.telemetry?.totalElements],
    [AlertTriangle, "Total incidents", data.incidents?.totalElements],
    [Activity, "Critical / high incidents", data.incidents ? criticalHigh : null],
    [Sparkles, "AI analysis records", data.analyses?.totalElements],
  ];
  const retry = () => { setData((current) => ({ ...current, loading: true })); setRefreshKey((key) => key + 1); };

  return <div className="page-stack">
    <section className="welcome-row"><div><div className="eyebrow">AUTOMATED INCIDENT INVESTIGATION</div><h2>Production overview</h2><p>Telemetry is correlated into incidents and analyzed automatically by the backend.</p><span className="refresh-note"><RefreshCw size={12} /> Refreshes every {Math.round(REFRESH_MS / 1000)} seconds</span></div><button className="button button-secondary" onClick={retry}><RefreshCw size={15} /> Refresh now</button></section>
    <div className="stats-grid">{cards.map(([Icon, label, value]) => <article className="stat-card" key={label}><span className="stat-icon"><Icon size={18} /></span><span className="stat-label">{label}</span><strong>{value ?? "—"}</strong><small>{data.errors[label === "Total telemetry events" ? "telemetry" : label === "Total incidents" || label === "Critical / high incidents" ? "incidents" : "analyses"] ? "Service data unavailable" : "Live backend count"}</small></article>)}</div>
    <section className="panel"><div className="panel-heading"><div><h3>Incidents by status</h3><p>Counts across the incident pages returned by the correlation service</p></div></div>{data.errors.incidents ? <div className="inline-error">{errorMessage(data.errors.incidents)} <button className="text-button" onClick={retry}>Retry</button></div> : Object.keys(incidentsByStatus).length ? <div className="status-breakdown">{Object.entries(incidentsByStatus).map(([status, count]) => <div className="status-count" key={status}><span>{status.replaceAll("_", " ")}</span><strong>{count}</strong></div>)}</div> : <EmptyState title="No incident statuses yet" detail="Status counts will appear when incidents are returned by the backend." />}</section>
    <section className="panel"><div className="panel-heading"><div><h3>Recent incidents</h3><p>Automatically correlated production incidents</p></div><Link className="inline-link" to="/incidents">All incidents <ArrowRight size={15} /></Link></div>{data.errors.incidents ? <div className="inline-error">{errorMessage(data.errors.incidents)} <button className="text-button" onClick={retry}>Retry</button></div> : incidentRows.length ? <IncidentTable incidents={incidentRows.slice(0, 5)} /> : <EmptyState title="No incidents returned" detail="New incidents appear here after telemetry correlation." />}</section>
    <section className="panel"><div className="panel-heading"><div><h3>Recent AI analysis</h3><p>Analysis status and findings from the AI service</p></div><Link className="inline-link" to="/analysis">All analyses <ArrowRight size={15} /></Link></div>{data.errors.analyses ? <div className="inline-error">{errorMessage(data.errors.analyses)} <button className="text-button" onClick={retry}>Retry</button></div> : analysisRows.length ? <div className="analysis-feed">{analysisRows.map((analysis) => { const status = String(analysis.status || "").toUpperCase(); return <article className="analysis-feed-row" key={analysis.id}><div className="analysis-feed-meta"><strong>{analysis.serviceName || "Unknown service"}</strong><span className={`analysis-badge status-${status.toLowerCase()}`}>{status || "Unknown"}</span><time>{timestamp(analysis.createdAt)}</time></div>{isAnalyzed(analysis) ? <p>{analysis.probableRootCause || "The backend marked this analysis complete without a root-cause summary."}</p> : <p>{status === "ANALYSIS_FAILED" ? "The backend reports that analysis failed." : `Analysis has not completed. Current state: ${status || "Unknown"}.`}</p>}</article>; })}</div> : <EmptyState title="No AI analyses yet" detail="The AI service has not returned any analysis records." />}</section>
    <section className="panel"><div className="panel-heading"><div><h3>Recent telemetry</h3><p>Latest events received by the telemetry service</p></div><Link className="inline-link" to="/telemetry">Browse events <ArrowRight size={15} /></Link></div>{data.errors.telemetry ? <div className="inline-error">{errorMessage(data.errors.telemetry)} <button className="text-button" onClick={retry}>Retry</button></div> : telemetryRows.length ? <div className="table-scroll"><table><thead><tr><th>Service</th><th>Type</th><th>Severity</th><th>Message</th><th>Trace ID</th><th>Event time</th></tr></thead><tbody>{telemetryRows.map((event) => <tr key={event.id}><td>{event.serviceName}</td><td>{event.eventType}</td><td><span className={`severity severity-${String(event.severity || "").toLowerCase()}`}>{event.severity}</span></td><td className="message-cell">{event.message}</td><td className="mono">{event.traceId || "—"}</td><td className="muted">{timestamp(event.eventTimestamp)}</td></tr>)}</tbody></table></div> : <EmptyState title="No telemetry returned" detail="Telemetry events will appear here after ingestion." />}</section>
  </div>;
}
