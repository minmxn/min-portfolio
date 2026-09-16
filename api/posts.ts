// Serves KV-published blog posts to the Lab page. Best-effort: returns an empty
// list (never 500s) so the page can always fall back to seed posts.
export const config = { runtime: "nodejs" };

import { kvGet } from "./_lib/kv";
import type { Post } from "../src/content/posts";

export default async function handler(): Promise<Response> {
  const posts = (await kvGet<Post[]>("blog:published")) ?? [];
  return new Response(JSON.stringify({ posts }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
  });
}
