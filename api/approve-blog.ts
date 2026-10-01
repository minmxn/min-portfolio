// Handles the links in the Telegram approval message: preview (read-only),
// approve, and reject. Token is validated against the single stored draft and
// consumed on approve/reject, so a stale/replayed link is inert. (preview does
// not consume the token.)
export const config = { runtime: "edge" };

import type { Post } from "../src/content/posts";
import { kvGet, kvSetJson, kvDel } from "./_lib/kv";
import { runWriteBlog, type DraftRecord } from "./write-blog";

const DRAFT_KEY = "blog:draft:current";
const PUBLISHED_KEY = "blog:published";

function page(title: string, body: string): Response {
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>${title}</title><body style="font-family:system-ui;max-width:40rem;margin:4rem auto;padding:0 1rem"><h1>${title}</h1><p>${body}</p></body>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const token = url.searchParams.get("token") ?? "";

  const draft = await kvGet<DraftRecord>(DRAFT_KEY);
  if (!draft || !token || draft.token !== token) {
    return page("Link expired", "This draft is no longer available (already handled, or expired). A new draft arrives next Monday.");
  }

  if (action === "preview") {
    // Read-only render of the full draft so it can be reviewed before
    // approving. Does NOT consume the token or mutate anything.
    const p = draft.post;
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const bodyHtml = p.body.map((para) => `<p>${esc(para)}</p>`).join("");
    const approve = `/api/approve-blog?action=approve&token=${token}`;
    const reject = `/api/approve-blog?action=reject&token=${token}`;
    return new Response(
      `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.title)}</title>` +
        `<body style="font-family:system-ui;max-width:42rem;margin:3rem auto;padding:0 1.25rem;line-height:1.6;color:#1a1a1a">` +
        `<div style="font:600 12px/1 ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:#059669">Draft preview</div>` +
        `<h1 style="font-size:2rem;margin:.5rem 0">${esc(p.title)}</h1>` +
        `<p style="color:#666;font-size:.9rem">${p.tags.map(esc).join(" · ")} · ${esc(p.readTime)}</p>` +
        `<p style="font-size:1.15rem;color:#555"><em>${esc(p.excerpt)}</em></p>` +
        bodyHtml +
        `<div style="margin-top:2.5rem;display:flex;gap:.75rem;flex-wrap:wrap">` +
        `<a href="${approve}" style="background:#059669;color:#fff;padding:.7rem 1.2rem;border-radius:.5rem;text-decoration:none">✅ Approve &amp; publish</a>` +
        `<a href="${reject}" style="background:#f3f4f6;color:#111;padding:.7rem 1.2rem;border-radius:.5rem;text-decoration:none">🔁 Reject &amp; rewrite</a>` +
        `</div></body>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  if (action === "approve") {
    const published = (await kvGet<Post[]>(PUBLISHED_KEY)) ?? [];
    const deduped = published.filter((p) => p.slug !== draft.post.slug);
    await kvSetJson(PUBLISHED_KEY, [draft.post, ...deduped]);
    await kvDel(DRAFT_KEY);
    return page("Published ✅", `“${draft.post.title}” is now live on your Lab page.`);
  }

  if (action === "reject") {
    // Regenerate FIRST: runWriteBlog(true) overwrites DRAFT_KEY with a fresh
    // record on success, so we must not delete the old draft beforehand (a
    // failure would lose this week's post) or after (it would wipe the
    // just-written new draft).
    try {
      const result = await runWriteBlog(true);
      return page(
        result.ok ? "Rewriting 🔁" : "That's this week's attempts",
        result.ok ? "Discarded. A fresh draft is on its way to your inbox." : "The weekly rewrite cap is reached — see you next Monday.",
      );
    } catch (err) {
      console.error("[approve-blog] reject/rewrite failed", err);
      return page("Couldn't rewrite", "Something went wrong generating a fresh draft. Your current draft is still intact — try the link again, or wait for next Monday's draft.");
    }
  }

  return page("Unknown action", "Use the buttons in the approval email.");
}
