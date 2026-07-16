import type { HazardReport, ReportStatus } from './types';

const OFFICER_TOKEN_KEY = 'firewatch-officer-token';

export function getOfficerToken(): string | null {
  return localStorage.getItem(OFFICER_TOKEN_KEY);
}

function setOfficerToken(token: string | null) {
  if (token) localStorage.setItem(OFFICER_TOKEN_KEY, token);
  else localStorage.removeItem(OFFICER_TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getOfficerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with ${res.status}`);
  }
  return res.json();
}

export function fetchReports(): Promise<HazardReport[]> {
  return fetch('/api/reports').then((res) => json<HazardReport[]>(res));
}

export function createReport(
  payload: Omit<HazardReport, 'id' | 'status' | 'createdAt' | 'dueAt'>,
): Promise<HazardReport> {
  return fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((res) => json<HazardReport>(res));
}

export function updateReportStatus(id: string, status: ReportStatus): Promise<HazardReport> {
  return fetch(`/api/reports/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  }).then((res) => json<HazardReport>(res));
}

export function sendTicketEmail(id: string): Promise<{ sentAt: number; recipient: string; simulated: boolean }> {
  return fetch(`/api/reports/${id}/send-ticket`, {
    method: 'POST',
    headers: authHeaders(),
  }).then((res) => json(res));
}

export async function officerLogin(passcode: string): Promise<boolean> {
  const res = await fetch('/api/officer/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode }),
  });
  if (!res.ok) return false;
  const { token } = await res.json();
  setOfficerToken(token);
  return true;
}

export async function officerCheckSession(): Promise<boolean> {
  const token = getOfficerToken();
  if (!token) return false;
  const res = await fetch('/api/officer/me', { headers: authHeaders() });
  if (!res.ok) return false;
  const { authenticated } = await res.json();
  if (!authenticated) setOfficerToken(null);
  return authenticated;
}

export async function officerLogout(): Promise<void> {
  await fetch('/api/officer/logout', { method: 'POST', headers: authHeaders() }).catch(() => {});
  setOfficerToken(null);
}
