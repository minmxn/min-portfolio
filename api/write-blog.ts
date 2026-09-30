// Weekly (Mon 08:00 SGT, via GitHub Actions) blog drafter. Gathers free
// sources, asks Groq for one draft in Min Yi's voice, stores it with a
// single-use token + 7-day expiry, and emails it for approval.
export const config = { runtime: "edge" };

import { OWNER } from "../src/content/portfolio";
import { POSTS, type Post } from "../src/content/posts";
import { gatherSources } from "./_lib/sources";
import { generateDraft, isoWeek, type DraftRecord } from "./_lib/blog";
import { kvGet, kvSetJson, kvExpire } from "./_lib/kv";

export type { DraftRecord } from "./_lib/blog";

const DRAFT_KEY = "blog:draft:current";
const DRAFT_TTL = 7 * 24 * 3600;
const MAX_REWRITES = 3;

function baseUrl(): string {
  // Vercel provides VERCEL_PROJECT_PRODUCTION_URL at runtime; allow an override.
  const explicit = process.env.SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const v = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return v ? `https://${v}` : "";
}

async function readGithubSummary(): Promise<string> {
  // aria:github is stored as a RAW (non-JSON) string by api/refresh-github.ts,
  // so kvGet's JSON.parse would throw on it. Read it directly, mirroring
  // api/aria.ts's readGithubSummary. Best-effort: any failure -> "".
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return "";
  try {
    const res = await fetch(`${url}/get/aria:github`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return "";
    const { result } = (await res.json()) as { result: string | null };
    return typeof result === "string" && result.length > 0 ? result : "";
  } catch {
    return "";
  }
}

async function emailDraft(post: Post, token: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const base = baseUrl();
  const approve = `${base}/api/approve-blog?action=approve&token=${token}`;
  const reject = `${base}/api/approve-blog?action=reject&token=${token}`;
  const bodyHtml = post.body.map((p) => `<p>${p}</p>`).join("");
  const html = `<h1>${post.title}</h1><p><em>${post.excerpt}</em></p>${bodyHtml}
    <p><strong>Tags:</strong> ${post.tags.join(", ")} · ${post.readTime}</p>
    <p><a href="${approve}">✅ Approve &amp; publish</a> &nbsp;|&nbsp; <a href="${reject}">🔁 Reject &amp; rewrite</a></p>`;
  if (!key) {
    console.log("[write-blog] draft ready (no RESEND_API_KEY):", { approve, reject, title: post.title });
    return;
  }
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "ARIA <onboarding@resend.dev>",
      to: [OWNER.email],
      subject: `Lab draft for review: ${post.title}`,
      html,
    }),
  });
}

export async function runWriteBlog(rewrite: boolean): Promise<{ ok: boolean; message: string }> {
  const week = isoWeek();
  const attemptsKey = `blog:attempts:${week}`;
  const attempts = (await kvGet<number>(attemptsKey)) ?? 0;

  if (rewrite && attempts > MAX_REWRITES) {
    return { ok: false, message: "Rewrite cap reached for this week." };
  }

  const [sources, github, published] = await Promise.all([
    gatherSources(),
    readGithubSummary(),
    kvGet<Post[]>("blog:published").then((p) => p ?? []),
  ]);
  const existingSlugs = [...published.map((p) => p.slug), ...POSTS.map((p) => p.slug)];

  const post = await generateDraft(sources, github, POSTS, existingSlugs);
  const token = crypto.randomUUID().replace(/-/g, "");
  const record: DraftRecord = { post, token, createdAt: new Date().toISOString(), rewrites: rewrite ? attempts : 0 };

  await kvSetJson(DRAFT_KEY, record);
  await kvExpire(DRAFT_KEY, DRAFT_TTL);
  await kvSetJson(attemptsKey, attempts + 1);
  await kvExpire(attemptsKey, DRAFT_TTL);
  await emailDraft(post, token);

  return { ok: true, message: `Draft ready: ${post.title}` };
}

export default async function handler(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const result = await runWriteBlog(false);
    return new Response(result.message, { status: result.ok ? 200 : 429 });
  } catch (err) {
    console.error("[write-blog]", err);
    return new Response("Draft generation failed", { status: 500 });
  }
}
