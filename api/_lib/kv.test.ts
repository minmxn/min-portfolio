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
