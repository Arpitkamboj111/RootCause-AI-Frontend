import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { api } from "../../services/api";
import { EmptyState, ErrorState, Loading } from "../../components/DataState";
import AnalysisRecord from "../../components/AnalysisRecord";

const normalize = (value) => String(value || "").trim().toLowerCase();
const timestamp = (value) => value ? new Date(value).toLocaleString() : "—";
const terminalAnalysis = (item) => ["ANALYZED", "ANALYSIS_FAILED"].includes(String(item?.status || "").toUpperCase());

export default function IncidentDetails() {
  const { id } = useParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const [incident, setIncident] = useState(null);
  const [events, setEvents] = useState(null);
  const [eventError, setEventError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisAmbiguous, setAnalysisAmbiguous] = useState(false);
  const [analysisContextMissing, setAnalysisContextMissing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    let timer;
    const refresh = async () => {
      if (document.hidden) {
        timer = window.setTimeout(refresh, 15000);
        return;
      }
      let shouldPoll = true;
      try {
        const item = await api.incident(id);
        let relatedEvents = [];
        let relatedError = null;
        try {
          const relationships = await api.incidentEvents(id);
          relatedEvents = await Promise.all(relationships.map(async (relationship) => {
            try {
              const telemetry = await api.telemetryEvent(relationship.telemetryEventId);
              return { ...relationship, ...telemetry, incidentEventId: relationship.id, telemetryEventId: relationship.telemetryEventId };
            } catch {
              return { ...relationship, incidentEventId: relationship.id, telemetryEventId: relationship.telemetryEventId };
            }
          }));
        } catch (eventRequestError) {
          relatedError = eventRequestError;
        }

        let matchedAnalysis = null;
        let ambiguous = false;
        let contextMissing = false;
        let lookupError = null;
        let keepPolling = true;
        if (item.rootService && item.description) {
          try {
            const page = await api.analyses(0, 100, { serviceName: item.rootService });
            const exactMatches = (page.content || []).filter((record) =>
              normalize(record.serviceName) === normalize(item.rootService)
              && normalize(record.errorMessage) === normalize(item.description));
            const traceIds = [...new Set(relatedEvents.map((event) => event.traceId).filter(Boolean))];
            const traceMatches = traceIds.length
              ? exactMatches.filter((record) => traceIds.includes(record.traceId))
              : [];
            const candidates = traceIds.length
              ? traceMatches.length ? traceMatches : exactMatches.every((record) => !record.traceId) ? exactMatches : []
              : exactMatches;
            if (candidates.length === 1) matchedAnalysis = candidates[0];
            else if (candidates.length > 1 || (exactMatches.length > 0 && traceIds.length > 0)) ambiguous = true;
            keepPolling = !ambiguous && (!matchedAnalysis || !terminalAnalysis(matchedAnalysis));
          } catch (analysisRequestError) {
            lookupError = analysisRequestError;
            keepPolling = false;
          }
        } else {
          contextMissing = true;
          keepPolling = false;
        }
        if (active) {
          setIncident(item);
          setEvents(relatedEvents);
          setEventError(relatedError);
          setAnalysis(matchedAnalysis);
          setAnalysisAmbiguous(ambiguous);
          setAnalysisContextMissing(contextMissing);
          setAnalysisError(lookupError);
          setError(null);
          shouldPoll = keepPolling;
        }
      } catch (incidentError) {
        if (active) setError(incidentError);
        shouldPoll = false;
      }
      if (active && shouldPoll && !document.hidden) timer = window.setTimeout(refresh, 15000);
    };
    refresh();
    return () => { active = false; window.clearTimeout(timer); };
  }, [id, refreshKey]);

  if (error) return <ErrorState error={error} onRetry={() => setRefreshKey((key) => key + 1)} />;
  if (!incident) return <Loading label="Loading incident details" />;

  return <div className="page-stack">
    <Link className="back-link" to="/incidents"><ArrowLeft size={16} /> Back to incidents</Link>
    <section className="panel detail-head"><div><div className="eyebrow">{incident.incidentKey || `INCIDENT #${incident.id}`}</div><h2>{incident.title}</h2><p>{incident.description || "No description was supplied for this incident."}</p></div><span className={`severity severity-${String(incident.severity || "").toLowerCase()}`}>{incident.severity}</span></section>
    <div className="detail-grid">
      <section className="panel"><div className="panel-heading"><div><h3>Incident context</h3><p>Fields returned by the correlation service</p></div></div><dl className="detail-list"><dt>Status</dt><dd>{incident.status || "—"}</dd><dt>Severity</dt><dd>{incident.severity || "—"}</dd><dt>Root service</dt><dd>{incident.rootService || "—"}</dd><dt>Affected services</dt><dd>{incident.affectedServices || "—"}</dd><dt>Detected</dt><dd>{timestamp(incident.detectedAt)}</dd><dt>Created</dt><dd>{timestamp(incident.createdAt)}</dd><dt>Last updated</dt><dd>{timestamp(incident.updatedAt)}</dd></dl></section>
      <section className="panel analysis-callout"><div className="panel-heading"><div><h3>Automatic AI analysis</h3><p>Triggered by the backend when this incident is created</p></div><button className="icon-button" aria-label="Refresh incident" onClick={() => setRefreshKey((key) => key + 1)}><RefreshCw size={15} /></button></div>{analysisError ? <ErrorState error={analysisError} onRetry={() => setRefreshKey((key) => key + 1)} /> : analysis ? <><span className={`analysis-badge status-${String(analysis.status || "").toLowerCase()}`}>{analysis.status}</span><p>{String(analysis.status).toUpperCase() === "ANALYZED" ? analysis.probableRootCause || "Analysis complete; no root-cause summary was returned." : `Analysis status: ${analysis.status}.`}</p><Link className="inline-link" to="/analysis">View all analysis results</Link></> : <EmptyState title={analysisContextMissing ? "Analysis cannot be matched" : analysisAmbiguous ? "Analysis match is ambiguous" : "No matching analysis yet"} detail={analysisContextMissing ? "This incident is missing the service name or error message needed to compare it with analysis records." : analysisAmbiguous ? "The backend does not expose an incident-to-analysis ID, and multiple records match this incident's service and error." : "No exact service and error match is available yet. Analysis may still be pending, skipped, or failed before a result was saved."} />}</section>
    </div>
    <section className="panel"><div className="panel-heading"><div><h3>Event timeline</h3><p>Telemetry events linked to this incident</p></div><Link className="inline-link" to="/telemetry">Browse telemetry</Link></div>{eventError ? <ErrorState error={eventError} onRetry={() => setRefreshKey((key) => key + 1)} /> : events === null ? <Loading label="Loading related events" /> : events.length ? <div className="event-timeline">{events.map((event) => <article className="timeline-event" key={event.incidentEventId}><span className="timeline-marker" /><div className="timeline-event-head"><strong>{event.serviceName || "Unknown service"}</strong><time>{timestamp(event.eventTimestamp)}</time></div><div className="timeline-event-meta"><span>{event.eventType || "Telemetry event"}</span><span>{event.severity || "—"}</span><span>Event #{event.telemetryEventId ?? "—"}</span></div><p>{event.message || "Telemetry event details are unavailable."}</p><div className="timeline-event-meta"><span>Trace ID: <code>{event.traceId || "—"}</code></span>{event.correlationReason && <span>{event.correlationReason}</span>}</div></article>)}</div> : <EmptyState title="No related telemetry events" detail="The incident service has not linked telemetry events to this incident." />}</section>
    {analysis && <AnalysisRecord analysis={analysis} />}
  </div>;
}
