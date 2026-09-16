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
