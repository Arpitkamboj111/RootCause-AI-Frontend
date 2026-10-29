import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../../services/api";
import { EmptyState, ErrorState, Loading } from "../../components/DataState";
import IncidentTable from "../../components/IncidentTable";

export default function Incidents() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const load = useCallback(() => { setError(null); setData(null); api.incidents(page, 20).then((result) => { setData(result); setError(null); }).catch(setError); }, [page]);
  useEffect(() => { api.incidents(page, 20).then((result) => { setData(result); setError(null); }).catch(setError); }, [page]);
  return <div className="page-stack"><section className="welcome-row"><div><div className="eyebrow">CORRELATION SERVICE</div><h2>Incidents</h2><p>Investigate correlated production failures and their affected services.</p></div></section><section className="panel">{error ? <ErrorState error={error} onRetry={load} /> : !data ? <Loading label="Loading incidents" /> : data.content?.length ? <><IncidentTable incidents={data.content} /><div className="pagination"><span>Page {data.number + 1} of {Math.max(data.totalPages || 1, 1)} · {data.totalElements ?? data.content.length} incidents</span><div><button className="icon-button" disabled={data.first} onClick={() => setPage((p) => Math.max(p - 1, 0))} aria-label="Previous page"><ChevronLeft size={17} /></button><button className="icon-button" disabled={data.last} onClick={() => setPage((p) => p + 1)} aria-label="Next page"><ChevronRight size={17} /></button></div></div></> : <EmptyState title="No incidents found" detail="The incident service returned an empty page." />}</section></div>;
}
