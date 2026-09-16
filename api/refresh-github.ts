// Nightly cron: fetch Min Yi's public GitHub repos and cache a compact summary
// in Vercel KV, so A.R.I.A (api/aria.ts) can mention recent project activity
// without hitting GitHub on every visitor request.
//
// Setup:
//   1. Enable Vercel KV on the project (auto-adds KV_REST_API_URL / _TOKEN).
//   2. Set OWNER.githubUser in src/content/portfolio.ts.
//   3. (Recommended) set a CRON_SECRET env var — Vercel sends it as a Bearer
//      token so only Vercel's scheduler can trigger this endpoint.
//   4. (Required in prod) set GITHUB_TOKEN — a read-only PAT (public repos).
//      GitHub 403s unauthenticated API calls from Vercel's cloud IPs.
//   5. The schedule lives in vercel.json ("crons").
export const config = { runtime: "edge" };

import { OWNER } from "../src/content/portfolio";

const KV_KEY = "aria:github";

interface Repo {
  name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
}

/**
 * Writes a value to Upstash Redis (Vercel KV) via its REST API, using the
 * command-array form (POST base URL with ["SET", key, value]). This is more
 * robust than the path form for values containing newlines/special chars.
 */
async function kvSet(value: string): Promise<void> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("KV not configured");
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["SET", KV_KEY, value]),
  });
  if (!res.ok) throw new Error(`KV set failed: ${res.status} ${await res.text()}`);
}

export default async function handler(req: Request): Promise<Response> {
  // Only Vercel's scheduler (or someone with the secret) may run this.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = OWNER.githubUser.trim();
  if (!user) return new Response("githubUser not set", { status: 200 });

  try {
    // GitHub blocks unauthenticated API calls from cloud IPs (like Vercel's) with
    // 403. A read-only token (public repos only) lifts that. Set GITHUB_TOKEN in
    // Vercel env vars; without it we still try (works locally, may 403 in prod).
    const ghHeaders: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "aria-portfolio",
    };
    if (process.env.GITHUB_TOKEN) ghHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=pushed`,
      { headers: ghHeaders },
    );
    if (!res.ok) throw new Error(`GitHub HTTP ${res.status}`);
    const repos = (await res.json()) as Repo[];

    const top = repos
      .filter((r) => !r.fork && !r.archived)
      .sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at))
      .slice(0, 5)
      .map((r) => {
        const when = new Date(r.pushed_at).toISOString().slice(0, 10);
        const desc = r.description ? ` — ${r.description}` : "";
        const lang = r.language ? ` [${r.language}]` : "";
        return `- ${r.name}${lang}${desc} (updated ${when})`;
      });

    const summary = top.length
      ? `Recent public GitHub repos (${user}):\n${top.join("\n")}`
      : "";

    await kvSet(summary);
    return new Response(`OK — cached ${top.length} repos`, { status: 200 });
  } catch (err) {
    console.error("[refresh-github]", err);
    return new Response("Refresh failed", { status: 500 });
  }
}
