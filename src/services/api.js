const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const USERNAME_KEY = "rootcause_username";
let sessionCheckInFlight;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const getUsername = () => sessionStorage.getItem(USERNAME_KEY);
export const clearUsername = () => sessionStorage.removeItem(USERNAME_KEY);

async function request(path, { method = "GET", body } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Unable to reach the API gateway. Check that it is running at the configured address.");
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event("rootcause-auth-expired"));
    }
    throw new ApiError(payload?.message || payload?.error || `Request failed (${response.status})`, response.status);
  }
  return payload;
}

const unwrap = (payload) => payload?.data ?? payload;
const query = (params) => new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== "")).toString();

export const api = {
  async login(username, password) {
    const data = unwrap(await request("/api/v1/auth/login", { method: "POST", body: { username, password } }));
    sessionStorage.setItem(USERNAME_KEY, username);
    return data;
  },
  async checkSession() {
    if (!sessionCheckInFlight) {
      sessionCheckInFlight = request(`/api/v1/telemetry/searchEvents?${query({ page: 0, size: 1 })}`)
        .finally(() => { sessionCheckInFlight = null; });
    }
    return sessionCheckInFlight;
  },
  async incidents(page = 0, size = 20) {
    return request(`/api/v1/incidents?${query({ page, size, sort: "detectedAt,desc" })}`);
  },
  async incident(id) { return request(`/api/v1/incidents/id?${query({ id })}`); },
  async incidentEvents(id) { return request(`/api/v1/incidents/id/events?${query({ id })}`); },
  async telemetry(page = 0, size = 20) {
    return unwrap(await request(`/api/v1/telemetry/searchEvents?${query({ page, size })}`));
  },
  async telemetryHealth() { return unwrap(await request("/api/v1/telemetry/health")); },
  async analyze(input) {
    return request("/api/v1/analysis", { method: "POST", body: input });
  },
  async analysis(id) { return unwrap(await request(`/api/v1/analysis/id?${query({ id })}`)); },
};

export function errorMessage(error) {
  return error?.status === 401 ? "Your session has expired. Sign in again to continue." : error?.message || "Something went wrong while loading data.";
}
