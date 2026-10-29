import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "./assets/layouts/DashboardLayout";
import Dashboard from "./assets/pages/Dashboard";
import Incidents from "./assets/pages/Incidents";
import IncidentDetails from "./assets/pages/IncidentDetails";
import Telemetry from "./assets/pages/Telemetry";
import Analysis from "./assets/pages/Analysis";
import Login from "./assets/pages/Login";
import { api, clearUsername, errorMessage, getUsername } from "./services/api";

function AppRoutes() {
  const [authState, setAuthState] = useState("checking");
  const [authError, setAuthError] = useState("");
  const [username, setUsername] = useState(getUsername());
  const handleSessionFailure = useCallback((error) => {
    clearUsername();
    if (error.status === 401) {
      setUsername(null);
      setAuthState("unauthenticated");
    } else {
      setAuthError(errorMessage(error));
      setAuthState("unavailable");
    }
    return false;
  }, []);
  const initializeSession = useCallback(async () => {
    try {
      await api.checkSession();
      setAuthState("authenticated");
      return true;
    } catch (error) {
      return handleSessionFailure(error);
    }
  }, [handleSessionFailure]);
  const checkSession = useCallback((showPending = true) => {
    if (showPending) {
      setAuthState("checking");
      setAuthError("");
    }
    return initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    let mounted = true;
    const expireSession = () => {
      clearUsername();
      setUsername(null);
      setAuthState("unauthenticated");
    };
    window.addEventListener("rootcause-auth-expired", expireSession);
    api.checkSession()
      .then(() => { if (mounted) setAuthState("authenticated"); })
      .catch((error) => { if (mounted) handleSessionFailure(error); });
    return () => {
      mounted = false;
      window.removeEventListener("rootcause-auth-expired", expireSession);
    };
  }, [handleSessionFailure]);

  if (authState === "checking") {
    return <main className="login-screen"><div className="state-box">Checking your authentication session…</div></main>;
  }
  if (authState === "unavailable") {
    return <main className="login-screen"><section className="login-card"><div className="login-copy"><div className="eyebrow">SESSION CHECK</div><h1>Unable to verify your session</h1><p>{authError}</p></div><button className="button button-primary login-submit" onClick={checkSession}>Retry</button></section></main>;
  }

  const finishLogin = async (name) => {
    setUsername(name);
    const validSession = await checkSession(false);
    return validSession;
  };
  return <Routes>
    <Route path="/login" element={authState === "authenticated" ? <Navigate to="/" replace /> : <Login onLogin={finishLogin} />} />
    <Route element={authState === "authenticated" ? <DashboardLayout username={username} /> : <Navigate to="/login" replace />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/incidents" element={<Incidents />} />
      <Route path="/incidents/:id" element={<IncidentDetails />} />
      <Route path="/telemetry" element={<Telemetry />} />
      <Route path="/analysis" element={<Analysis />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

export default function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}
