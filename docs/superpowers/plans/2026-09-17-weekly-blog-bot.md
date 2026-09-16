# Weekly Lab Blog Bot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A weekly, human-approved bot that drafts one on-brand, source-grounded Lab post, emails it for approval, and publishes it to the Lab page on one click.

**Architecture:** A GitHub Actions `schedule` (Mon 08:00 SGT) POSTs `/api/write-blog` (a Node serverless function) with the `CRON_SECRET` bearer. `write-blog` gathers free sources (Hacker News + RSS + the cached GitHub summary), asks Groq to pick 3–5 items and write one draft in Min Yi's voice, stores it in Vercel KV with a single-use token and 7-day expiry, and emails it via Resend with **Approve** and **Reject & rewrite** links. `/api/approve-blog` handles both actions; `/api/posts` serves published posts. `lab.tsx` loads published posts at runtime and merges them with the 3 code-based seed posts.

**Tech Stack:** TypeScript, Vercel serverless (Node runtime) + KV (Upstash REST), Groq (OpenAI-compatible), Resend, React 19, Vitest (new — for pure helpers only), GitHub Actions.

## Global Constraints

- **Runtime:** `api/write-blog.ts`, `api/approve-blog.ts`, `api/posts.ts` MUST declare `export const config = { runtime: "nodejs" };` (NOT `edge` — RSS/XML parsing needs Node). The existing `api/aria.ts` and `api/refresh-github.ts` stay `edge`.
- **No new paid services.** Groq (free), Vercel Hobby, Resend (free), Vercel KV (free) only. No new npm runtime dependencies in `api/*` — use `fetch` and hand-rolled parsing, mirroring `api/refresh-github.ts`.
- **Auth:** every write endpoint guards on `CRON_SECRET` via `Authorization: Bearer <secret>`, exactly like `api/refresh-github.ts:43-45`.
- **Groq:** reuse `GROQ_API_KEY`. Model `"openai/gpt-oss-120b"` with fallback `"openai/gpt-oss-20b"` on error. Endpoint `https://api.groq.com/openai/v1/chat/completions`.
- **KV REST:** `KV_REST_API_URL` / `KV_REST_API_TOKEN`. GET returns `{ result: string | null }`. Mirror the helpers in `api/refresh-github.ts:29-39` and `api/aria.ts:120-136`.
- **Email:** Resend `https://api.resend.com/emails`, `from: "ARIA <onboarding@resend.dev>"`, `to: [OWNER.email]`. Mirror `api/aria.ts:96-106`.
- **Timezone:** Asia/Singapore. Post `date` stamped as e.g. `"Sep 2026"` via `Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Singapore", month: "short", year: "numeric" })`.
- **Grounding rules (prompt):** cite/link ONLY fetched sources; never invent news, dates, or metrics; keep Min Yi's first-person, from-experience voice using the 3 seed posts as style examples; thin week → shorter opinion post.
- **Rewrite cap:** max 3 rewrites per ISO week (initial draft + up to 3 regenerations).
- **Never** weaken the human approve step. No auto-publish path may exist.

---

## File Structure

- `src/content/posts.ts` **(new)** — the `Post` type + the 3 seed `POSTS` (moved out of `lab.tsx`). Shared by the React page and `api/posts.ts`.
- `api/_lib/kv.ts` **(new)** — generic KV REST helpers: `kvGet`, `kvSetJson`, `kvDel`, `kvExpire`.
- `api/_lib/sources.ts` **(new)** — `fetchHackerNews`, `fetchRssFeed`, `gatherSources`; returns normalized `SourceItem[]`.
- `api/_lib/blog.ts` **(new)** — `slugify`, `dedupeSlug`, `buildDraftPrompt`, `generateDraft` (Groq call), `DraftRecord` type, weekly-key helpers, `isoWeek`.
- `api/write-blog.ts` **(new)** — POST handler: gather → generate → store draft → email.
- `api/approve-blog.ts` **(new)** — GET handler: `action=approve` publishes; `action=reject` regenerates (capped).
- `api/posts.ts` **(new)** — GET handler: returns published posts JSON.
- `.github/workflows/write-blog.yml` **(new)** — weekly schedule that curls `/api/write-blog`.
- `src/components/lab.tsx` **(modify)** — import `Post`/`POSTS` from `src/content/posts.ts`; load published posts at runtime and merge.
- `vitest.config.ts` + `package.json` **(modify)** — add Vitest for pure-helper unit tests.

---

## Task 1: Testing foundation (Vitest) + extract seed posts

**Files:**
- Modify: `package.json` (add `vitest`, `test` script)
- Create: `vitest.config.ts`
- Create: `src/content/posts.ts`
- Modify: `src/components/lab.tsx:15-97` (remove local `Post`/`POSTS`, import instead)
- Test: `src/content/posts.test.ts`

**Interfaces:**
- Produces: `export type Post = { slug: string; title: string; date: string; readTime: string; tags: string[]; excerpt: string; body: string[]; accent: [string, string]; kicker: string; cover?: string; links: { label: string; href: string }[] };` and `export const POSTS: Post[]` (the 3 existing posts, verbatim).

- [ ] **Step 1: Add Vitest**

```bash
npm install -D vitest
```

Add to `package.json` scripts (keep existing lines):

```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: { environment: "node", include: ["src/**/*.test.ts", "api/**/*.test.ts"] },
});
```

- [ ] **Step 3: Write the failing test**

`src/content/posts.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { POSTS } from "./posts";

describe("seed posts", () => {
  it("exposes the three seed posts with unique slugs", () => {
    expect(POSTS).toHaveLength(3);
    const slugs = POSTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(3);
    expect(slugs).toContain("skills-not-prompts");
  });

  it("every post has the required shape", () => {
    for (const p of POSTS) {
      expect(typeof p.title).toBe("string");
      expect(Array.isArray(p.body)).toBe(true);
      expect(p.accent).toHaveLength(2);
      expect(Array.isArray(p.links)).toBe(true);
    }
  });
});
```

- [ ] **Step 4: Run it, verify it fails**

Run: `npm test -- src/content/posts.test.ts`
Expected: FAIL — `Cannot find module './posts'`.

- [ ] **Step 5: Create `src/content/posts.ts`**

Move the `Post` type (currently `lab.tsx:15-31`) and the entire `POSTS` array (`lab.tsx:33-97`) into this new file, verbatim, and `export` both. Add a top comment:

```ts
// Seed Lab posts + the shared Post type. These 3 posts live in code (no KV
// migration); api/posts.ts and lab.tsx merge them with KV-published posts.
export type Post = {
  // ...exact fields from lab.tsx:15-31...
};

export const POSTS: Post[] = [
  // ...the 3 posts, copied verbatim from lab.tsx:33-97...
];
```

- [ ] **Step 6: Update `lab.tsx` to import**

In `src/components/lab.tsx`, delete the local `type Post = {...}` and `const POSTS = [...]` blocks, and add near the top imports:

```ts
import { type Post, POSTS } from "@/content/posts";
```

- [ ] **Step 7: Run tests + type-check**

Run: `npm test -- src/content/posts.test.ts` → Expected: PASS
Run: `npm run build` → Expected: type-checks clean, no unused-symbol errors.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/content/posts.ts src/content/posts.test.ts src/components/lab.tsx
git commit -m "test: add vitest and extract seed posts to src/content/posts.ts"
```

---

## Task 2: KV helpers

**Files:**
- Create: `api/_lib/kv.ts`
- Test: `api/_lib/kv.test.ts`

**Interfaces:**
- Consumes: `KV_REST_API_URL`, `KV_REST_API_TOKEN` env vars.
- Produces:
  - `kvGet<T>(key: string): Promise<T | null>` — GET, JSON-parses `result`, returns `null` if unset/misconfigured. Never throws on a missing value.
  - `kvSetJson(key: string, value: unknown): Promise<void>` — POST `JSON.stringify(value)`; throws on non-2xx.
  - `kvDel(key: string): Promise<void>` — `/del/<key>`.
  - `kvExpire(key: string, seconds: number): Promise<void>` — `/expire/<key>/<seconds>`.

- [ ] **Step 1: Write the failing test** (`api/_lib/kv.test.ts`)

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { kvGet, kvSetJson } from "./kv";

const OLD = process.env;
beforeEach(() => { process.env = { ...OLD, KV_REST_API_URL: "https://kv.test", KV_REST_API_TOKEN: "tok" }; });
afterEach(() => { process.env = OLD; vi.restoreAllMocks(); });

describe("kvGet", () => {
  it("returns null when KV is not configured", async () => {
    process.env.KV_REST_API_URL = "";
    expect(await kvGet("x")).toBeNull();
  });

  it("parses the JSON stored under result", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ result: JSON.stringify([{ a: 1 }]) }), { status: 200 })));
    expect(await kvGet<{ a: number }[]>("k")).toEqual([{ a: 1 }]);
  });

  it("returns null when result is null", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ result: null }), { status: 200 })));
    expect(await kvGet("k")).toBeNull();
  });
});

describe("kvSetJson", () => {
  it("throws on non-2xx", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("no", { status: 500 })));
    await expect(kvSetJson("k", { a: 1 })).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npm test -- api/_lib/kv.test.ts` → Expected: FAIL — module not found.

- [ ] **Step 3: Implement `api/_lib/kv.ts`**

```ts
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
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm test -- api/_lib/kv.test.ts` → Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/kv.ts api/_lib/kv.test.ts
git commit -m "feat: add generic KV REST helpers for blog endpoints"
```

---

## Task 3: Source gathering (Hacker News + RSS)

**Files:**
- Create: `api/_lib/sources.ts`
- Test: `api/_lib/sources.test.ts`

**Interfaces:**
- Produces:
  - `type SourceItem = { title: string; url: string; source: string; date: string };`
  - `parseRss(xml: string, source: string): SourceItem[]` — pure; handles `<item>` (RSS) and `<entry>` (Atom); strips CDATA; tolerates missing fields.
  - `fetchHackerNews(): Promise<SourceItem[]>` — Algolia `search_by_date?tags=story&query=AI&numericFilters=created_at_i>...` past 7 days; best-effort, returns `[]` on error.
  - `fetchRssFeed(url: string, source: string): Promise<SourceItem[]>` — best-effort.
  - `gatherSources(): Promise<SourceItem[]>` — runs all fetches with `Promise.allSettled`; a failed source contributes `[]`, never rejects.
  - `const RSS_FEEDS: { url: string; source: string }[]` — Anthropic, OpenAI, GitHub, Simon Willison, Hugging Face, Latent Space.

- [ ] **Step 1: Write the failing test** (`api/_lib/sources.test.ts`)

```ts
import { describe, it, expect } from "vitest";
import { parseRss } from "./sources";

describe("parseRss", () => {
  it("parses RSS <item> elements", () => {
    const xml = `<rss><channel>
      <item><title>Hello AI</title><link>https://ex.com/a</link><pubDate>Mon, 15 Sep 2026 10:00:00 GMT</pubDate></item>
      <item><title><![CDATA[Second]]></title><link>https://ex.com/b</link></item>
    </channel></rss>`;
    const items = parseRss(xml, "Example");
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ title: "Hello AI", url: "https://ex.com/a", source: "Example" });
    expect(items[1].title).toBe("Second");
  });

  it("parses Atom <entry> elements with href links", () => {
    const xml = `<feed><entry><title>Atom Post</title><link href="https://ex.com/c"/></entry></feed>`;
    const items = parseRss(xml, "Atom");
    expect(items[0]).toMatchObject({ title: "Atom Post", url: "https://ex.com/c" });
  });

  it("returns [] for junk input", () => {
    expect(parseRss("not xml", "X")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npm test -- api/_lib/sources.test.ts` → Expected: FAIL — module not found.

- [ ] **Step 3: Implement `api/_lib/sources.ts`**

```ts
// Free, key-less source gathering for the weekly blog bot. Every fetch is
// best-effort: a dead feed contributes [] and never fails the run.
export type SourceItem = { title: string; url: string; source: string; date: string };

export const RSS_FEEDS: { url: string; source: string }[] = [
  { url: "https://www.anthropic.com/rss.xml", source: "Anthropic" },
  { url: "https://openai.com/news/rss.xml", source: "OpenAI" },
  { url: "https://github.blog/feed/", source: "GitHub" },
  { url: "https://simonwillison.net/atom/everything/", source: "Simon Willison" },
  { url: "https://huggingface.co/blog/feed.xml", source: "Hugging Face" },
  { url: "https://www.latent.space/feed", source: "Latent Space" },
];

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").trim();
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(stripCdata(m[1])) : "";
}

export function parseRss(xml: string, source: string): SourceItem[] {
  const items: SourceItem[] = [];
  const blocks = xml.match(/<(item|entry)[\s\S]*?<\/(item|entry)>/gi) ?? [];
  for (const block of blocks) {
    const title = tag(block, "title");
    // RSS uses <link>text</link>; Atom uses <link href="..."/>.
    let url = tag(block, "link");
    if (!url) {
      const href = block.match(/<link[^>]*href="([^"]+)"/i);
      url = href ? decode(href[1]) : "";
    }
    const date = tag(block, "pubDate") || tag(block, "updated") || tag(block, "published");
    if (title && url) items.push({ title, url, source, date });
  }
  return items;
}

export async function fetchRssFeed(url: string, source: string): Promise<SourceItem[]> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "aria-portfolio" } });
    if (!res.ok) return [];
    return parseRss(await res.text(), source).slice(0, 8);
  } catch {
    return [];
  }
}

export async function fetchHackerNews(): Promise<SourceItem[]> {
  const since = Math.floor(Date.now() / 1000) - 7 * 24 * 3600;
  const url = `https://hn.algolia.com/api/v1/search_by_date?tags=story&query=AI&numericFilters=created_at_i%3E${since},points%3E20&hitsPerPage=20`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "aria-portfolio" } });
    if (!res.ok) return [];
    const data = (await res.json()) as { hits?: { title?: string; url?: string; objectID: string; created_at: string }[] };
    return (data.hits ?? [])
      .filter((h) => h.title)
      .map((h) => ({
        title: h.title!,
        url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
        source: "Hacker News",
        date: h.created_at,
      }))
      .slice(0, 12);
  } catch {
    return [];
  }
}

export async function gatherSources(): Promise<SourceItem[]> {
  const jobs: Promise<SourceItem[]>[] = [
    fetchHackerNews(),
    ...RSS_FEEDS.map((f) => fetchRssFeed(f.url, f.source)),
  ];
  const settled = await Promise.allSettled(jobs);
  return settled.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm test -- api/_lib/sources.test.ts` → Expected: PASS.

- [ ] **Step 5: Manual live-fetch sanity check (optional but recommended)**

Run a throwaway check that the real feeds resolve (network required):

```bash
node --input-type=module -e "import('./api/_lib/sources.ts').catch(()=>{}); " 2>/dev/null || echo "skip if tsx not available"
```

If this errors on TS import, skip — the unit test already covers parsing. Live-feed URLs are verified during the Task 6 smoke test instead.

- [ ] **Step 6: Commit**

```bash
git add api/_lib/sources.ts api/_lib/sources.test.ts
git commit -m "feat: add best-effort HN + RSS source gathering"
```

---

## Task 4: Blog helpers (slug, ISO week, prompt, Groq draft)

**Files:**
- Create: `api/_lib/blog.ts`
- Test: `api/_lib/blog.test.ts`

**Interfaces:**
- Consumes: `SourceItem` (Task 3), `Post` (`src/content/posts.ts`, Task 1), `GROQ_API_KEY`.
- Produces:
  - `type DraftRecord = { post: Post; token: string; createdAt: string; rewrites: number };`
  - `slugify(title: string): string` — lowercase, alphanumerics→`-`, trim dashes.
  - `dedupeSlug(slug: string, existing: string[]): string` — append `-2`, `-3`, … until unique.
  - `isoWeek(d?: Date): string` — e.g. `"2026-W38"` in Asia/Singapore.
  - `sgMonthYear(d?: Date): string` — e.g. `"Sep 2026"`.
  - `buildDraftPrompt(sources: SourceItem[], githubSummary: string, seed: Post[]): { system: string; user: string }`.
  - `generateDraft(sources: SourceItem[], githubSummary: string, seed: Post[], existingSlugs: string[]): Promise<Post>` — calls Groq (120b, falls back to 20b), parses JSON, coerces to `Post`, sets `date`, dedupes slug. Throws on total failure.

- [ ] **Step 1: Write the failing test** (`api/_lib/blog.test.ts`)

```ts
import { describe, it, expect } from "vitest";
import { slugify, dedupeSlug, isoWeek, buildDraftPrompt } from "./blog";
import type { SourceItem } from "./sources";

describe("slugify", () => {
  it("kebab-cases a title", () => {
    expect(slugify("I stopped writing CLEVER prompts!")).toBe("i-stopped-writing-clever-prompts");
  });
});

describe("dedupeSlug", () => {
  it("returns the slug when unique", () => {
    expect(dedupeSlug("a", ["b"])).toBe("a");
  });
  it("appends -2 on collision", () => {
    expect(dedupeSlug("a", ["a"])).toBe("a-2");
    expect(dedupeSlug("a", ["a", "a-2"])).toBe("a-3");
  });
});

describe("isoWeek", () => {
  it("formats as YYYY-Www", () => {
    expect(isoWeek(new Date("2026-09-17T00:00:00Z"))).toMatch(/^\d{4}-W\d{2}$/);
  });
});

describe("buildDraftPrompt", () => {
  it("includes grounding rules, sources, and seed voice", () => {
    const sources: SourceItem[] = [{ title: "Big AI news", url: "https://x.com/1", source: "HN", date: "" }];
    const seed = [{ slug: "s", title: "T", date: "Sep 2026", readTime: "3 min", tags: ["Agents"], excerpt: "e", body: ["b"], accent: ["#a", "#b"] as [string, string], kicker: "k", links: [] }];
    const { system, user } = buildDraftPrompt(sources, "repo summary", seed);
    expect(system).toMatch(/never invent/i);
    expect(user).toContain("Big AI news");
    expect(user).toContain("https://x.com/1");
    expect(system).toContain("T"); // seed title appears as style example
  });
});
```

- [ ] **Step 2: Run it, verify it fails**

Run: `npm test -- api/_lib/blog.test.ts` → Expected: FAIL — module not found.

- [ ] **Step 3: Implement `api/_lib/blog.ts`**

```ts
import type { Post } from "../../src/content/posts";
import type { SourceItem } from "./sources";

export type DraftRecord = { post: Post; token: string; createdAt: string; rewrites: number };

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];

export function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function dedupeSlug(slug: string, existing: string[]): string {
  if (!existing.includes(slug)) return slug;
  for (let n = 2; ; n++) {
    const candidate = `${slug}-${n}`;
    if (!existing.includes(candidate)) return candidate;
  }
}

function sgParts(d: Date): { year: string; month: string; week: number } {
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Singapore", year: "numeric", month: "short" });
  const parts = Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]));
  // ISO week number (UTC-based approximation, adequate for a weekly key).
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((t.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return { year: parts.year, month: parts.month, week };
}

export function isoWeek(d: Date = new Date()): string {
  const { year, week } = sgParts(d);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function sgMonthYear(d: Date = new Date()): string {
  const { year, month } = sgParts(d);
  return `${month} ${year}`;
}

export function buildDraftPrompt(
  sources: SourceItem[],
  githubSummary: string,
  seed: Post[],
): { system: string; user: string } {
  const examples = seed
    .map((p) => `### ${p.title}\n${p.body.join("\n\n")}`)
    .join("\n\n---\n\n");

  const system = `You write ONE short blog post for Min Yi's "Lab notes" — a personal, first-person developer blog about AI, agents, GitHub, and how she actually builds with AI.

VOICE: first-person, from-experience, plainspoken, a little self-deprecating. NOT "In today's fast-paced AI landscape". Match the style examples below exactly.

STYLE EXAMPLES (match this voice, do NOT copy the content):
${examples}

HARD RULES:
- Ground everything in the SOURCES provided by the user. Never invent news, dates, metrics, product names, or quotes.
- Only include links that appear in the SOURCES. "Further reading" must be real and from the list.
- If the sources are thin, write a SHORTER opinion/"thoughts" post rather than padding with filler.
- 3–5 paragraphs. No headings inside the body.

Respond with ONLY a JSON object, no markdown fence:
{"title": string, "excerpt": string (1-2 sentences), "body": string[] (3-5 paragraphs), "tags": string[] (1-3, e.g. "Agents","GitHub","Workflow","Tips"), "readTime": string (e.g. "4 min"), "accent": [string,string] (two hex colors for a gradient cover), "kicker": string (short cover label), "links": [{"label": string, "href": string}] (2-4, from SOURCES only)}`;

  const sourceLines = sources.map((s) => `- [${s.source}] ${s.title} — ${s.url}`).join("\n");
  const user = `This week's SOURCES (pick the strongest 3–5 to write about):\n${sourceLines || "(no external items this week)"}\n\nMy recent GitHub activity:\n${githubSummary || "(none)"}`;

  return { system, user };
}

async function callGroq(system: string, user: string): Promise<string> {
  let lastErr: unknown;
  for (const model of MODELS) {
    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: system }, { role: "user", content: user }],
          temperature: 0.7,
          max_tokens: 1600,
          response_format: { type: "json_object" },
        }),
      });
      if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const content = data.choices?.[0]?.message?.content;
      if (content) return content;
      throw new Error("Empty Groq response");
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr ?? new Error("Groq failed");
}

export async function generateDraft(
  sources: SourceItem[],
  githubSummary: string,
  seed: Post[],
  existingSlugs: string[],
): Promise<Post> {
  const { system, user } = buildDraftPrompt(sources, githubSummary, seed);
  const raw = await callGroq(system, user);
  const parsed = JSON.parse(raw) as Partial<Post>;
  if (!parsed.title || !Array.isArray(parsed.body) || parsed.body.length === 0) {
    throw new Error("Draft missing title/body");
  }
  const accent: [string, string] = Array.isArray(parsed.accent) && parsed.accent.length === 2
    ? [parsed.accent[0], parsed.accent[1]]
    : ["#a7f3d0", "#059669"];
  return {
    slug: dedupeSlug(slugify(parsed.title), existingSlugs),
    title: parsed.title,
    date: sgMonthYear(),
    readTime: parsed.readTime || "4 min",
    tags: (parsed.tags ?? ["AI usage"]).slice(0, 3),
    excerpt: parsed.excerpt || parsed.body[0].slice(0, 160),
    body: parsed.body,
    accent,
    kicker: parsed.kicker || (parsed.tags ?? ["Lab"])[0],
    links: (parsed.links ?? []).filter((l) => l && l.href && l.label).slice(0, 4),
  };
}
```

- [ ] **Step 4: Run tests, verify pass**

Run: `npm test -- api/_lib/blog.test.ts` → Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/blog.ts api/_lib/blog.test.ts
git commit -m "feat: add slug/week/prompt/Groq draft helpers for blog bot"
```

---

## Task 5: `/api/posts` endpoint

**Files:**
- Create: `api/posts.ts`

**Interfaces:**
- Consumes: `kvGet` (Task 2), `Post` (Task 1).
- Produces: `GET /api/posts` → `200` JSON `{ posts: Post[] }` (KV `blog:published`, or `[]` if empty). The React page merges these with seed posts, so this endpoint returns ONLY KV posts.

- [ ] **Step 1: Implement `api/posts.ts`**

```ts
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
```

- [ ] **Step 2: Type-check**

Run: `npm run build` → Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add api/posts.ts
git commit -m "feat: add /api/posts endpoint serving published blog posts"
```

---

## Task 6: `/api/write-blog` endpoint (draft + email)

**Files:**
- Create: `api/write-blog.ts`

**Interfaces:**
- Consumes: `gatherSources` (Task 3), `generateDraft`/`DraftRecord`/`isoWeek` (Task 4), `kvGet`/`kvSetJson`/`kvExpire` (Task 2), `POSTS` (Task 1), `OWNER.email`.
- Produces:
  - Exported `runWriteBlog(rewrite: boolean): Promise<{ ok: boolean; message: string }>` — reused by Task 7's reject path.
  - `POST /api/write-blog` guarded by `CRON_SECRET`.
  - KV keys written: `blog:draft:current` = `DraftRecord` (7-day expiry); `blog:attempts:<isoWeek>` = attempt count.
  - Email includes links: `<BASE>/api/approve-blog?action=approve&token=<token>` and `...&action=reject&token=<token>`.

- [ ] **Step 1: Implement `api/write-blog.ts`**

```ts
// Weekly (Mon 08:00 SGT, via GitHub Actions) blog drafter. Gathers free
// sources, asks Groq for one draft in Min Yi's voice, stores it with a
// single-use token + 7-day expiry, and emails it for approval.
export const config = { runtime: "nodejs" };

import { randomUUID } from "node:crypto";
import { OWNER } from "../src/content/portfolio";
import { POSTS, type Post } from "../src/content/posts";
import { gatherSources } from "./_lib/sources";
import { generateDraft, isoWeek, type DraftRecord } from "./_lib/blog";
import { kvGet, kvSetJson, kvExpire } from "./_lib/kv";

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
  const raw = await kvGet<string>("aria:github"); // stored as a raw string, not JSON
  return typeof raw === "string" ? raw : "";
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
  const token = randomUUID().replace(/-/g, "");
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
```

- [ ] **Step 2: Type-check**

Run: `npm run build` → Expected: clean.

- [ ] **Step 3: Smoke test with `vercel dev`**

```bash
npx vercel dev --listen 3000
```

In a second shell (set a local `CRON_SECRET` in `.env` / `.env.local` first, or omit the header if unset):

```bash
curl -s -X POST http://localhost:3000/api/write-blog -H "authorization: Bearer $CRON_SECRET"
```

Expected: `200 Draft ready: <title>`. With no `RESEND_API_KEY`, the approve/reject URLs are logged to the `vercel dev` console — confirm the JSON draft looks on-voice and the links point at `/api/approve-blog`. Confirm at least one RSS/HN item was pulled (add a temporary `console.log(sources.length)` if unsure, then remove it).

- [ ] **Step 4: Commit**

```bash
git add api/write-blog.ts
git commit -m "feat: add /api/write-blog drafter with source grounding + email"
```

---

## Task 7: `/api/approve-blog` endpoint (approve + reject/rewrite)

**Files:**
- Create: `api/approve-blog.ts`

**Interfaces:**
- Consumes: `kvGet`/`kvSetJson`/`kvDel` (Task 2), `DraftRecord` (Task 4), `runWriteBlog` (Task 6), `Post` (Task 1).
- Produces: `GET /api/approve-blog?action=approve|reject&token=<token>` → HTML confirmation page. Approve: token must match the stored draft, then prepend `post` to `blog:published` and `kvDel` the draft (single-use). Reject: `kvDel` the draft, call `runWriteBlog(true)`.

- [ ] **Step 1: Implement `api/approve-blog.ts`**

```ts
// Handles the two links in the approval email. Token is validated against the
// single stored draft and consumed on use, so a stale/replayed link is inert.
export const config = { runtime: "nodejs" };

import type { Post } from "../src/content/posts";
import { kvGet, kvSetJson, kvDel } from "./_lib/kv";
import { runWriteBlog, type DraftRecord } from "./write-blog";
// NOTE: DraftRecord is re-exported from write-blog for this import; if the
// linter prefers, import it from "./_lib/blog" instead — same type.

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
```

- [ ] **Step 2: Re-export `DraftRecord` from `write-blog.ts`**

Add to the top-level exports of `api/write-blog.ts` (after the existing imports):

```ts
export type { DraftRecord } from "./_lib/blog";
```

(Or change the import in `approve-blog.ts` to `from "./_lib/blog"` and skip this step — pick one and delete the note comment.)

- [ ] **Step 3: Type-check**

Run: `npm run build` → Expected: clean.

- [ ] **Step 4: Smoke test the full loop with `vercel dev`**

With `vercel dev` running and a draft created (Task 6 Step 3), grab the approve URL from the console log and:

```bash
curl -s "http://localhost:3000/api/approve-blog?action=approve&token=<token>"
curl -s "http://localhost:3000/api/posts"
```

Expected: approve returns the "Published ✅" HTML; `/api/posts` now returns the new post in `posts`. Re-running the same approve URL returns "Link expired" (single-use). Repeat once for `action=reject` (confirm a new draft is logged, and attempts increment).

- [ ] **Step 5: Commit**

```bash
git add api/approve-blog.ts api/write-blog.ts
git commit -m "feat: add /api/approve-blog approve + reject/rewrite handler"
```

---

## Task 8: Lab page reads published posts at runtime

**Files:**
- Modify: `src/components/lab.tsx`

**Interfaces:**
- Consumes: `GET /api/posts` → `{ posts: Post[] }`; `POSTS` seed (Task 1).
- Produces: merged, deduped post list (published first, seed after) used by `Feed` and `PostDetail`.

- [ ] **Step 1: Add a hook that loads + merges posts**

In `src/components/lab.tsx`, add near the top (after imports):

```ts
import { useEffect, useState } from "react";

// Published (KV) posts first, then seed posts, deduped by slug. If the fetch
// fails or returns nothing, the page still shows the 3 seed posts.
function useMergedPosts(): Post[] {
  const [published, setPublished] = useState<Post[]>([]);
  useEffect(() => {
    let alive = true;
    fetch("/api/posts")
      .then((r) => (r.ok ? r.json() : { posts: [] }))
      .then((d: { posts?: Post[] }) => { if (alive) setPublished(d.posts ?? []); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  const seen = new Set(published.map((p) => p.slug));
  return [...published, ...POSTS.filter((p) => !seen.has(p.slug))];
}
```

- [ ] **Step 2: Thread merged posts through `Feed`, `PostDetail`, and `Lab`**

Change `Feed` to accept posts:

```tsx
function Feed({ activeTag, posts }: { activeTag?: string; posts: Post[] }) {
  const visible = activeTag ? posts.filter((p) => p.tags.includes(activeTag)) : posts;
  const allTags = [...new Set(posts.flatMap((p) => p.tags))];
  // ...rest unchanged...
}
```

Update `Lab` to load and pass posts:

```tsx
export function Lab() {
  const hash = useActiveHash();
  const posts = useMergedPosts();
  const rest = hash.startsWith("#lab/") ? hash.slice("#lab/".length) : "";

  if (rest.startsWith("t/")) {
    const activeTag = decodeURIComponent(rest.slice("t/".length));
    return (
      <PageShell>
        <Feed activeTag={activeTag} posts={posts} />
      </PageShell>
    );
  }

  const post = posts.find((p) => p.slug === rest);
  return <PageShell>{post ? <PostDetail post={post} /> : <Feed posts={posts} />}</PageShell>;
}
```

- [ ] **Step 3: Type-check + lint**

Run: `npm run build` → Expected: clean (no references to the removed module-level `POSTS` filtering remain).
Run: `npm run lint` → Expected: clean.

- [ ] **Step 4: Visual smoke test**

Run: `npm run dev`, open `/#lab`. Expected: the 3 seed posts render as before (the `/api/posts` fetch 404s under plain `vite dev` — that's fine, the catch falls back to seed). Under `vercel dev` with a published post in KV, that post appears on top. Click a post → detail renders; click a tag → filter works.

- [ ] **Step 5: Commit**

```bash
git add src/components/lab.tsx
git commit -m "feat: Lab page merges KV-published posts with seed posts at runtime"
```

---

## Task 9: GitHub Actions weekly schedule

**Files:**
- Create: `.github/workflows/write-blog.yml`

**Interfaces:**
- Consumes repo secrets: `CRON_SECRET`, `SITE_URL` (the production base URL, e.g. `https://<project>.vercel.app`).
- Produces: a weekly POST to `/api/write-blog`.

- [ ] **Step 1: Create the workflow**

```yaml
name: Weekly Lab blog draft
on:
  schedule:
    # 00:00 UTC Monday == 08:00 Asia/Singapore Monday
    - cron: "0 0 * * 1"
  workflow_dispatch: {} # allow manual "run now" from the Actions tab

jobs:
  draft:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger write-blog
        run: |
          code=$(curl -s -o /dev/stderr -w "%{http_code}" -X POST \
            "${SITE_URL}/api/write-blog" \
            -H "authorization: Bearer ${CRON_SECRET}")
          echo "HTTP $code"
          test "$code" = "200"
        env:
          SITE_URL: ${{ secrets.SITE_URL }}
          CRON_SECRET: ${{ secrets.CRON_SECRET }}
```

- [ ] **Step 2: Document required secrets**

Add a short note to `docs/weekly-blog-bot.md` under a new "Deployment / secrets" line: GitHub repo secrets `CRON_SECRET` (same value as Vercel env) and `SITE_URL`; Vercel env vars already present (`GROQ_API_KEY`, `KV_REST_API_URL/TOKEN`, `RESEND_API_KEY`, `CRON_SECRET`), plus `SITE_URL` or reliance on `VERCEL_PROJECT_PRODUCTION_URL`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/write-blog.yml docs/weekly-blog-bot.md
git commit -m "ci: add weekly GitHub Actions schedule for the blog bot"
```

- [ ] **Step 4: Manual verification (post-deploy)**

After merging + deploying, run the workflow manually via the Actions tab ("Run workflow" → `workflow_dispatch`). Expected: green run, `HTTP 200`, and a draft email in Min Yi's inbox. Approve it and confirm it appears at `/#lab`.

---

## Self-Review

**1. Spec coverage:**
- Trigger = GitHub Actions Mon 08:00 SGT → Task 9 ✅ (`0 0 * * 1` UTC).
- Node runtime for RSS parsing → Global Constraints + every handler's `config` ✅.
- Sources (HN + 6 RSS + GitHub summary, pick 3–5) → Task 3 + prompt in Task 4 ✅.
- Groq 120b w/ 20b fallback, seed posts as style examples, grounding rules → Task 4 ✅.
- Draft → KV with single-use token + 7-day expiry → Task 6 (`kvExpire`, `randomUUID` token) ✅.
- Email with Approve + Reject → Task 6 email; Task 7 handler ✅.
- Reject regenerates, capped at 3/week → Task 6 `runWriteBlog(true)` + `blog:attempts:<week>` cap; Task 7 wires it ✅.
- Slug de-dupe → Task 4 `dedupeSlug`, used in Task 6 ✅.
- Seed posts stay code-only, merged (not hidden) → Task 1 + Task 8 ✅ (explicit refinement of the doc's "fallback" wording).
- `/api/posts` + Lab runtime read → Tasks 5, 8 ✅.
- Best-effort per-source `try/catch` → Task 3 `Promise.allSettled` ✅.

**2. Placeholder scan:** No TBD/TODO; every code step is concrete. The one "pick one" note (Task 7 Step 2 `DraftRecord` import source) is a real either/or with both branches specified — resolve during implementation.

**3. Type consistency:** `Post` (single definition in `src/content/posts.ts`) used everywhere; `DraftRecord`, `SourceItem`, `runWriteBlog`, `isoWeek`, `generateDraft`, `slugify`, `dedupeSlug` signatures match across producing/consuming tasks. KV keys are consistent: `blog:published`, `blog:draft:current`, `blog:attempts:<isoWeek>`, `aria:github`.

**Open risk to watch during build:** the RSS feed URLs in Task 3 are best-guess; verify each resolves during the Task 6 smoke test and swap any dead one (a bad feed is harmless — it just contributes `[]`).
