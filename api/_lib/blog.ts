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
