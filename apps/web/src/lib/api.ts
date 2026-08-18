const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function parse(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error || "Алдаа гарлаа");
  return data;
}

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API}${path}`, { ...init, headers, credentials: "include" });
  } catch {
    throw new ApiError(503, "API сервер ажиллахгүй байна. Терминалд npm run dev:api ажиллуулна уу.");
  }
  if (res.status === 401 && !path.startsWith("/api/auth/")) {
    const refreshed = await fetch(`${API}/api/auth/refresh`, { method: "POST", credentials: "include" });
    if (refreshed.ok) {
      const body = await refreshed.json();
      if (body.accessToken) localStorage.setItem("accessToken", body.accessToken);
      headers.set("Authorization", `Bearer ${body.accessToken}`);
      res = await fetch(`${API}${path}`, { ...init, headers, credentials: "include" });
    }
  }
  return parse(res);
}

export const apiUrl = API;

export function toFormData(fields: Record<string, string>, files: File[], field = "files") {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  for (const file of files) fd.append(field, file);
  return fd;
}
