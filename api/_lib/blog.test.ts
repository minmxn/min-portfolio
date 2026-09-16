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
