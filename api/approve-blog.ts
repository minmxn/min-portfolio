// Handles the two links in the approval email. Token is validated against the
// single stored draft and consumed on use, so a stale/replayed link is inert.
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
