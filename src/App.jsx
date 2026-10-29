import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "./assets/layouts/DashboardLayout";
import Dashboard from "./assets/pages/Dashboard";
import Incidents from "./assets/pages/Incidents";
import IncidentDetails from "./assets/pages/IncidentDetails";
import Telemetry from "./assets/pages/Telemetry";
import Analysis from "./assets/pages/Analysis";
import Login from "./assets/pages/Login";
import { getToken, getUsername } from "./services/api";

function AppRoutes() {
  const [token, setToken] = useState(getToken());
  const [username, setUsername] = useState(getUsername());
  useEffect(() => {
    const expireSession = () => {
      setToken(null);
      setUsername(null);
    };
    window.addEventListener("rootcause-auth-expired", expireSession);
    return () => window.removeEventListener("rootcause-auth-expired", expireSession);
  }, []);
  return <Routes>
    <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login onLogin={(name) => { setToken(getToken()); setUsername(name); }} />} />
    <Route element={token ? <DashboardLayout username={username} onLogout={() => { setToken(null); setUsername(null); }} /> : <Navigate to="/login" replace />}>
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
