"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_KEY = "portfolio_admin_token";

export const auth = {
  getToken: () =>
    typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Browser-side API client; attaches the admin JWT when present. */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = auth.getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body.message)
      ? body.message.join(", ")
      : (body.message ?? res.statusText);
    if (res.status === 401) auth.clear();
    throw new ApiError(res.status, message);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const json = (body: unknown) => JSON.stringify(body);
