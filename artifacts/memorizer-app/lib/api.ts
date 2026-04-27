const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

function resolveApiBase(): string {
  if (apiBaseUrl) return apiBaseUrl;

  console.error(
    "[API] EXPO_PUBLIC_API_BASE_URL is not set. " +
      "Add it to .env.local for local dev, or to EAS secrets for production builds.",
  );

  return "";
}

export const API_BASE = resolveApiBase();

export interface MnemonicResponse {
  id: number;
  textId: string;
  content: string;
  mnemonicType: string;
  status: "generating" | "ready" | "error" | "pending";
  errorMessage?: string | null;
}

export interface AcronymResponse {
  id: number;
  textId: string;
  acronym: string;
  explanation: string;
  status: "generating" | "ready" | "error" | "pending";
  errorMessage?: string | null;
}

export async function triggerMnemonicGeneration(
  textId: string,
  content: string,
  daysLeft: number,
  token?: string | null,
  contentType?: string,
): Promise<{ status: string }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/texts/${textId}/mnemonic`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content, daysLeft, contentType }),
  });

  if (!res.ok && res.status !== 202) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<{ status: string }>;
}

export async function fetchMnemonic(textId: string, token?: string | null): Promise<MnemonicResponse> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/texts/${textId}/mnemonic`, { headers });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<MnemonicResponse>;
}

export async function triggerAcronymGeneration(
  textId: string,
  content: string,
  token?: string | null,
): Promise<{ status: string }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/texts/${textId}/acronym`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content }),
  });

  if (!res.ok && res.status !== 202) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<{ status: string }>;
}

export async function fetchAcronym(textId: string, token?: string | null): Promise<AcronymResponse> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/texts/${textId}/acronym`, { headers });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<AcronymResponse>;
}

export async function detectContentType(
  textId: string,
  token?: string | null,
): Promise<{ contentType: string; source: string }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/texts/${textId}/detect-content-type`, {
    method: "POST",
    headers,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<{ contentType: string; source: string }>;
}
