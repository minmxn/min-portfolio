// Generic Vercel KV (Upstash) REST helpers. Mirrors the inline helpers in
// api/refresh-github.ts and api/aria.ts, centralized for the blog endpoints.
function creds(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

export async function kvGet<T>(key: string): Promise<T | null> {
  const c = creds();
  if (!c) return null;
  try {
    const res = await fetch(`${c.url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${c.token}` },
    });
    if (!res.ok) return null;
    const { result } = (await res.json()) as { result: string | null };
    if (result == null) return null;
    return JSON.parse(result) as T;
  } catch {
    return null;
  }
}

export async function kvSetJson(key: string, value: unknown): Promise<void> {
  const c = creds();
  if (!c) throw new Error("KV not configured");
  const res = await fetch(`${c.url}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${c.token}` },
    body: JSON.stringify(value),
  });
  if (!res.ok) throw new Error(`KV set failed: ${res.status}`);
}

export async function kvDel(key: string): Promise<void> {
  const c = creds();
  if (!c) throw new Error("KV not configured");
  const res = await fetch(`${c.url}/del/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${c.token}` },
  });
  if (!res.ok) throw new Error(`KV del failed: ${res.status}`);
}

export async function kvExpire(key: string, seconds: number): Promise<void> {
  const c = creds();
  if (!c) throw new Error("KV not configured");
  const res = await fetch(`${c.url}/expire/${encodeURIComponent(key)}/${seconds}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${c.token}` },
  });
  if (!res.ok) throw new Error(`KV expire failed: ${res.status}`);
}
