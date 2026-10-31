import { useState } from "react";
import { Check, Copy, LoaderCircle, X } from "lucide-react";

const date = (value) => value ? new Date(value).toLocaleString() : "—";
const isAnalyzed = (analysis) => String(analysis.status || "").toUpperCase() === "ANALYZED";
const fixes = (value) => String(value || "").split(/\n+/).map((line) => line.replace(/^\s*(?:\d+[.)]|[-*])\s*/, "").trim()).filter(Boolean);

export default function AnalysisRecord({ analysis, compact = false }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const copyStackTrace = async () => {
    try {
      await navigator.clipboard.writeText(analysis.stackTrace);
      setCopied(true);
      setCopyError("");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError("Clipboard access is unavailable in this browser.");
    }
  };
  const status = String(analysis.status || "UNKNOWN").toUpperCase();

  return <article className={`panel analysis-record${compact ? " analysis-record-compact" : ""}`}>
    <div className="analysis-record-heading"><div><div className="eyebrow">ANALYSIS #{analysis.id}</div><h3>{analysis.serviceName || "Unknown service"}</h3></div><span className={`analysis-badge status-${status.toLowerCase()}`}>{status}</span></div>
    <div className="analysis-context"><div><span>Severity</span><strong>{analysis.severity || "—"}</strong></div><div><span>Trace ID</span><strong className="mono">{analysis.traceId || "—"}</strong></div><div><span>Created</span><strong>{date(analysis.createdAt)}</strong></div></div>
    {!compact && <section className="analysis-section"><h4>Error message</h4><p className="analysis-pre">{analysis.errorMessage || "No error message was recorded."}</p></section>}
    <section className="analysis-section"><div className="analysis-section-title"><h4>Stack trace</h4>{analysis.stackTrace && <button className="copy-button" onClick={copyStackTrace}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy"}</button>}</div>{analysis.stackTrace ? <pre className="stack-trace">{analysis.stackTrace}</pre> : <p className="analysis-missing">No stack trace was provided.</p>}{copyError && <p className="analysis-copy-error">{copyError}</p>}</section>
    {isAnalyzed(analysis) ? <>
      <section className="root-cause-section"><div className="eyebrow">PROBABLE ROOT CAUSE</div><p>{analysis.probableRootCause || "Analysis completed without a root-cause summary."}</p></section>
      <section className="analysis-section"><h4>Evidence</h4><p className="analysis-pre">{analysis.evidence || "No evidence was returned."}</p></section>
      <section className="analysis-section"><h4>Suggested fixes</h4>{fixes(analysis.suggestedFix).length ? <ol className="fix-list">{fixes(analysis.suggestedFix).map((fix, index) => <li key={`${index}-${fix}`}>{fix}</li>)}</ol> : <p className="analysis-missing">No suggested fixes were returned.</p>}</section>
    </> : <div className={`analysis-not-ready ${status === "ANALYSIS_FAILED" ? "analysis-failed" : ""}`}>{status === "ANALYSIS_FAILED" ? <X size={16} /> : <LoaderCircle size={16} className="spin" />}<span>{status === "ANALYSIS_FAILED" ? "The backend reports that analysis failed." : `The backend has not confirmed completion. Current status: ${status}.`}</span></div>}
  </article>;
}
