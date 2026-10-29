import { useState } from "react";
import { Activity, ArrowRight, LoaderCircle } from "lucide-react";
import { api, errorMessage } from "../../services/api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState(""); const [password, setPassword] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { await api.login(username, password); onLogin(username); } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); } };
  return <main className="login-screen"><section className="login-card"><div className="brand login-brand"><span className="brand-icon"><Activity size={22} /></span><span><b>RootCause<span className="accent"> AI</span></b><small>Production incident investigator</small></span></div><div className="login-copy"><div className="eyebrow">SECURE WORKSPACE</div><h1>Welcome back</h1><p>Sign in to investigate production incidents.</p></div><form onSubmit={submit} className="login-form"><label>Username<input autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} required /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="button button-primary login-submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <>Sign in <ArrowRight size={16} /></>}</button></form></section></main>;
}
