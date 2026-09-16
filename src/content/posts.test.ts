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
