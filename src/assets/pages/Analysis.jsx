import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { api } from "../../services/api";
import { EmptyState, ErrorState, Loading } from "../../components/DataState";
import AnalysisRecord from "../../components/AnalysisRecord";

export default function Analysis() {
  const [page, setPage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let active = true;
    let inFlight = false;
    const refresh = async () => {
      if (inFlight || document.hidden) return;
      inFlight = true;
      try {
        const result = await api.analyses(page, 10);
        if (active) { setData(result); setError(null); }
      } catch (requestError) {
        if (active) setError(requestError);
      } finally {
        inFlight = false;
      }
    };
    refresh();
    const interval = window.setInterval(refresh, 30000);
    return () => { active = false; window.clearInterval(interval); };
  }, [page, refreshKey]);
  const refreshResults = () => { setError(null); setRefreshKey((key) => key + 1); };

  return <div className="page-stack">
    <section className="welcome-row"><div><div className="eyebrow">AUTOMATED AI ANALYSIS</div><h2>Root cause analysis</h2><p>Analysis results created automatically when telemetry produces a new incident.</p><span className="refresh-note"><Sparkles size={12} /> Results refresh every 30 seconds</span></div><button className="button button-secondary" onClick={refreshResults}><Sparkles size={15} /> Refresh results</button></section>
    {error ? <section className="panel"><ErrorState error={error} onRetry={refreshResults} /></section> : !data ? <Loading label="Loading AI analysis records" /> : data.content?.length ? <>
      <div className="analysis-records">{data.content.map((item) => <AnalysisRecord key={item.id} analysis={item} />)}</div>
      <div className="pagination"><span>Page {data.number + 1} of {Math.max(data.totalPages || 1, 1)} · {data.totalElements ?? data.content.length} analysis records</span><div><button className="icon-button" disabled={data.first} onClick={() => setPage((current) => Math.max(current - 1, 0))} aria-label="Previous page"><ChevronLeft size={17} /></button><button className="icon-button" disabled={data.last} onClick={() => setPage((current) => current + 1)} aria-label="Next page"><ChevronRight size={17} /></button></div></div>
    </> : <section className="panel"><EmptyState title="No analysis records yet" detail="AI analysis records appear here after an incident triggers the backend analysis workflow." /></section>}
  </div>;
}
