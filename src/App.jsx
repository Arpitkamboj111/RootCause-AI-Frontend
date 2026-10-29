import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardLayout from "./assets/layouts/DashboardLayout";
import Dashboard from "./assets/pages/Dashboard";
import Incidents from "./assets/pages/Incidents";
import IncidentDetails from "./assets/pages/IncidentDetails";
import Telemetry from "./assets/pages/Telemetry";
import Analysis from "./assets/pages/Analysis";
import Login from "./assets/pages/Login";
import { getToken } from "./services/api";

function AppRoutes() {
  const [token, setToken] = useState(getToken());
  useEffect(() => {
    const expireSession = () => setToken(null);
    window.addEventListener("rootcause-auth-expired", expireSession);
    return () => window.removeEventListener("rootcause-auth-expired", expireSession);
  }, []);
  return <Routes>
    <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login onLogin={() => setToken(getToken())} />} />
    <Route element={token ? <DashboardLayout onLogout={() => setToken(null)} /> : <Navigate to="/login" replace />}>
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
