import { AlertCircle, LoaderCircle, Radio } from "lucide-react";
import { errorMessage } from "../services/api";

export function Loading({ label = "Loading data" }) { return <div className="state-box"><LoaderCircle className="spin" size={20} /><span>{label}…</span></div>; }
export function ErrorState({ error, onRetry }) { return <div className="state-box state-error"><AlertCircle size={19} /><span>{errorMessage(error)}</span>{onRetry && <button className="text-button" onClick={onRetry}>Try again</button>}</div>; }
export function EmptyState({ title, detail }) { return <div className="empty-state"><span className="empty-icon"><Radio size={19} /></span><b>{title}</b><p>{detail}</p></div>; }
