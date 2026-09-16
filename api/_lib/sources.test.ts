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
