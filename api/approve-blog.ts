// Handles the two links in the approval email. Token is validated against the
// single stored draft and consumed on use, so a stale/replayed link is inert.
export const config = { runtime: "nodejs" };

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
    await kvSetJson(PUBLISHED_KEY, [draft.post, ...published]);
    await kvDel(DRAFT_KEY);
    return page("Published ✅", `“${draft.post.title}” is now live on your Lab page.`);
  }

  if (action === "reject") {
    await kvDel(DRAFT_KEY);
    const result = await runWriteBlog(true);
    return page(
      result.ok ? "Rewriting 🔁" : "That's this week's attempts",
      result.ok ? "Discarded. A fresh draft is on its way to your inbox." : "The weekly rewrite cap is reached — see you next Monday.",
    );
  }

  return page("Unknown action", "Use the buttons in the approval email.");
}
