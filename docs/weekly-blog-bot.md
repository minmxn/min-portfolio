# Design doc — Weekly AI blog bot for the Lab page

**Status:** Draft / not built yet
**Owner:** Min Yi
**Last updated:** 2026-09-17

## Goal

Keep the `#lab` notes feed alive with a fresh, on-brand post roughly once a
week — about trending AI / GitHub / agent-skills topics — **without** it
sounding like generic AI slop or hallucinating opinions I never held. The point
is to read like a real practitioner who's paying attention, so it should be
grounded in real sources and reviewed by me before anything goes live.

## Decisions locked in

- **Autonomy: draft → I approve.** The bot writes a draft weekly and emails it
  to me. Nothing publishes until I click an approve link. (Rejected: fully
  auto-publish — too risky for authenticity, which is the whole point.)
- **Sources: Hacker News API + blog RSS** (+ my own GitHub activity). All free,
  no new API keys.
- **Images: keep the generated gradient covers.** The bot just picks an accent
  colour per post. No stock-photo sourcing, licensing, or attribution to manage.

## What we already have (nothing new to buy)

This is mostly wiring together infra that already exists in this repo:

| Capability | Already in repo | Where |
| --- | --- | --- |
| LLM API (free, OpenAI-compatible) | Groq, `GROQ_API_KEY` in Vercel env | `api/aria.ts` |
| Scheduler | Vercel Cron (nightly GitHub refresh) | `vercel.json`, `api/refresh-github.ts` |
| Storage | Vercel KV, `KV_REST_API_URL` / `_TOKEN` | `api/refresh-github.ts` |
| Email delivery | Resend, `RESEND_API_KEY` | `api/aria.ts` (`runTool`) |
| Real source material | Weekly GitHub summary cached in KV (`aria:github`) | `api/refresh-github.ts` |
| Cron auth pattern | `CRON_SECRET` Bearer check | `api/refresh-github.ts` |

## Architecture

```
Weekly Vercel Cron (e.g. Mon 08:00)  →  api/write-blog.ts
  1. Fetch sources (server-side, free, no keys):
       • Hacker News Algolia API — top AI stories from the past week
       • RSS: Anthropic / OpenAI / GitHub blogs (parse XML)
       • My GitHub weekly summary (already in KV: aria:github)
  2. Groq writes ONE draft in my voice → { title, excerpt, body, tags, links }
       - reuse GROQ_API_KEY
       - bump model to openai/gpt-oss-120b for quality (still free)
       - pass the existing 3 Lab posts as STYLE EXAMPLES every run
  3. Save to KV as a draft with a random approve token
  4. Resend emails me: rendered draft + "Approve & publish" link
  5. I click → api/approve-blog.ts validates token → flips status to published
Lab page reads published posts from api/posts.ts
  (falls back to the hardcoded POSTS array if KV is empty)
```

## New pieces to build

| File | Responsibility |
| --- | --- |
| `api/write-blog.ts` | Cron handler: gather sources → Groq draft → save draft to KV → email me. Guarded by `CRON_SECRET`. |
| `api/approve-blog.ts` | `GET /api/approve-blog?id=<id>&token=<token>` → validate → publish. |
| `api/posts.ts` | Returns published posts as JSON for the Lab page. |
| `vercel.json` | Add one weekly cron entry alongside the existing nightly one. |
| `src/components/lab.tsx` | Refactor: read posts from `api/posts.ts` at runtime; keep the current `POSTS` array as seed/fallback. |

### Proposed KV schema

```
blog:published        → JSON array of Post (newest first), served to the site
blog:draft:<id>       → JSON { post: Post, token: string, createdAt: string }
```

`Post` reuses the existing shape in `lab.tsx` (`slug, title, date, readTime,
tags, excerpt, body, accent, kicker, links`). Publishing = move the draft's
`post` into `blog:published` and delete the draft key.

### Prompt strategy (the part that makes or breaks it)

- **Ground, don't invent.** System prompt gets ONLY the fetched HN/RSS/GitHub
  items and instructs: cite these, link back to them, never invent news, dates,
  or metrics.
- **Voice lock.** Include my existing 3 posts verbatim as style examples so
  drafts keep the first-person, from-experience tone (not "In today's
  fast-paced AI landscape…").
- **Graceful thin weeks.** If sources are sparse, write a shorter opinion/
  "thoughts" post instead of padding with filler.
- **Link discipline.** Only include links that came from the fetched sources,
  so "Further reading" is always real and live.

## Things to look out for (future gotchas)

Read this before building or when something breaks.

1. **Vercel Cron limits.** CONFIRMED 2026-09-17: account is on the **Hobby
   plan**, which allows **2 cron jobs max, each at most once per day** (timing
   not minute-precise). We already use 1 (`refresh-github`, nightly), so a weekly
   blog cron would be 2/2 — it fits, but leaves zero spare slots.
   **Decision: prefer the GitHub Actions fallback** — a free scheduled workflow
   (`schedule:` cron) that pings the `write-blog` endpoint with `CRON_SECRET`.
   GitHub Actions has unlimited free crons, so this keeps the 2nd Vercel slot
   free and avoids the once-per-day timing fuzz. (Alt: fold generation into the
   existing nightly Vercel cron, gated to run only on Mondays.)

2. **Edge runtime vs. RSS/XML parsing.** The existing functions use
   `runtime: "edge"`. Edge has no Node `xml2js` etc. Parse RSS with a tiny
   regex/`DOMParser`-free approach, or run `write-blog` as a Node serverless
   function (`runtime: "nodejs"`) instead of edge. Decide per-endpoint.

3. **Secure the approve link.** The approve URL publishes content, so it MUST
   carry an unguessable token that's checked server-side and single-use (delete
   the draft on approve). Never make publish a bare `GET /api/approve-blog?id=5`.
   Also rate-limit / expire drafts so stale tokens can't be replayed.

4. **`slug` collisions.** Auto-generated titles can produce duplicate slugs.
   Slugify + de-dupe (append `-2`) before saving, or prefix with the ISO week.
   The Lab router matches `#lab/<slug>`, so a dup would shadow an older post.

5. **KV as source of truth = deploys don't reset content.** Good, but it means
   the hardcoded `POSTS` array and KV can drift. Keep `POSTS` strictly as an
   empty-KV fallback/seed, and decide whether the seed posts should also be
   pushed into KV once (one-time migration) so they're editable/deletable.

6. **Content moderation / accuracy.** Even grounded, the model can misread a
   headline or overstate a claim in my name. The human approve step is the
   safety net — do NOT weaken it to save 60 seconds. Skim every draft.

7. **Source reliability.** HN Algolia and blog RSS feeds change formats / go
   down. Every fetch must be best-effort and independently `try/catch`ed (mirror
   `readGithubSummary` in `api/aria.ts`): if a source fails, drop it and
   continue rather than failing the whole run. Never let one dead feed skip a
   week.

8. **Groq free-tier rate limits & model availability.** `gpt-oss-120b` is free
   but slower and rate-limited; a weekly single call is trivially within limits,
   but if we ever batch or retry, back off. Also pin a fallback model in case a
   model id is deprecated (they change).

9. **Timezone.** The site reasons in Asia/Singapore (see `api/aria.ts`).
   Schedule the cron and stamp post `date` in the same zone so "this week" lines
   up with what I'd expect.

10. **Cost creep.** Everything here is free today (Groq free tier, Vercel Hobby,
    Resend free tier, KV free tier). Watch: Resend's free monthly email cap, KV
    storage/ops quota as posts accumulate, and any move to a paid Vercel plan.
    Prune old drafts; cap `blog:published` length if it grows large.

11. **SEO / sharing (nice-to-have, currently N/A).** The site is a hash-routed
    SPA (`#lab/<slug>`), so posts aren't individually crawlable or
    link-previewable. If the blog becomes a real audience play, that's a bigger
    change (real routes + prerender/OG tags), not part of this MVP.

## Rough effort

~2–3 new API files + one `vercel.json` cron line + the Lab data-source swap.
A few focused hours. No new paid services.

## Open questions before building

- Confirm Vercel plan allows a second cron (see gotcha #1).
- Node vs. edge runtime for `write-blog` (see gotcha #2).
- Should the existing 3 seed posts be migrated into KV, or stay code-only
  fallbacks (see gotcha #5)?
