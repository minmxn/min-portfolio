import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { AmbientBackground } from "@/components/ambient-background";
import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { useActiveHash } from "@/components/top-nav";

const EMAIL = "seetminyi.work@gmail.com";

// ---------------------------------------------------------------------------
// Placeholder content — swap the copy freely. Each post has a `slug` (used in
// the URL: #lab/<slug>), a hooky title, feed excerpt, and a full `body` of
// paragraphs shown on the detail view. Add posts by appending to this array.
// ---------------------------------------------------------------------------

type Post = {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  tags: string[];
  excerpt: string;
  body: string[];
  // Cover art. `accent` is a [from, to] gradient used to generate on-brand
  // cover art; set `cover` to a real image URL to override it. `kicker` is the
  // short overlay label on the cover.
  accent: [string, string];
  kicker: string;
  cover?: string;
  // Real, relevant links shown as "Further reading" on the detail page.
  links: { label: string; href: string }[];
};

const POSTS: Post[] = [
  {
    slug: "skills-not-prompts",
    title: "I stopped writing clever prompts. My output got better.",
    date: "Sep 2026",
    readTime: "4 min",
    tags: ["Agents", "Workflow"],
    excerpt:
      "A clever prompt is a one-off. The moment I let an agent own a boring, repeatable slice of my week, everything changed — and the trick wasn't a smarter prompt at all.",
    body: [
      "For a long time I treated the prompt as the product. I'd tune wording, add examples, threaten the model with consequences — and get an answer that was great once and unrepeatable the next day.",
      "The shift was embarrassingly simple: I wrote down the checklist I already followed and handed it over verbatim. How I scope a change. How I review a diff. What 'done' means. That's a skill, not a prompt — a decision you make once and stop re-making.",
      "The output got more consistent than I am on a tired Friday. Not because the model got smarter, but because I stopped relying on my mood to supply the process. If you're still hand-crafting prompts, you're paying a tax every single time.",
      "My rule now: if I've explained the same thing to an agent twice, it should have been a skill the first time.",
    ],
    accent: ["#a7f3d0", "#059669"],
    kicker: "Agent skills",
    links: [
      { label: "Anthropic — Agent Skills", href: "https://www.anthropic.com/news" },
      { label: "Claude Code docs", href: "https://docs.claude.com/en/docs/claude-code" },
    ],
  },
  {
    slug: "copilot-vs-agent",
    title: "Copilot and a terminal agent are not competing for the same job.",
    date: "Aug 2026",
    readTime: "6 min",
    tags: ["GitHub", "Tooling"],
    excerpt:
      "Everyone frames it as a fight. It isn't. One keeps you in flow line by line; the other takes a messy task end to end. Here's exactly where each earns its keep.",
    body: [
      "Inline completion solves a typing problem. When I already know the shape of a function, Copilot fills the obvious middle faster than I can, and I stay in flow. It's a keyboard accelerator, not a thinker.",
      "A terminal agent solves a coordination problem. 'This test is flaky, find out why' spans more files than I want to hold in my head. I hand it the whole task and review the diff, not the keystrokes.",
      "The mistake is asking one to do the other's job — babysitting an agent for a one-liner, or expecting autocomplete to refactor across ten files. Match the tool to the size of the unit of work.",
      "I use both every day and rarely think about which. Small, known, in-editor: Copilot. Large, fuzzy, cross-file: agent. The boundary is the size of the thing in my head.",
    ],
    accent: ["#bfdbfe", "#4f46e5"],
    kicker: "GitHub · Tooling",
    links: [
      { label: "GitHub Copilot", href: "https://github.com/features/copilot" },
      { label: "Claude Code", href: "https://claude.com/claude-code" },
    ],
  },
  {
    slug: "read-the-plausible-code",
    title: "The danger isn't bad AI code. It's plausible code you didn't read.",
    date: "Jul 2026",
    readTime: "3 min",
    tags: ["Tips", "AI usage"],
    excerpt:
      "The counter-intuitive part of building with AI: the clearer your own spec, the more leverage you get. Vague asks get vague code. Here are the habits that made my outputs boringly reliable.",
    body: [
      "AI rarely writes obviously broken code. It writes code that looks right, compiles, and quietly does the wrong thing on the edge case you didn't mention. That's more dangerous than a red squiggle, because nothing warns you.",
      "So I keep the loop tight. Small diffs I can actually read. Real verification, not vibes. And a hard rule: I don't ship anything I couldn't explain out loud to a colleague.",
      "The other half is upstream. A vague ask — 'add auth' — gets vague code. A crisp spec — 'add email+password auth, lock out after 5 tries, return 429' — gets something reviewable. The model is a fast, literal junior; give it a literal brief.",
      "The tools got faster. The standard for what I'll put my name on didn't move an inch.",
    ],
    accent: ["#fde68a", "#d97706"],
    kicker: "Tips · AI usage",
    links: [
      { label: "GitHub Docs — Copilot", href: "https://docs.github.com/en/copilot" },
      { label: "Simon Willison on LLMs", href: "https://simonwillison.net" },
    ],
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 font-mono text-[11px] tracking-[0.24em] text-emerald-600 uppercase">
      {children}
    </div>
  );
}

// Clickable tag chip → filters the feed at #lab/t/<tag>. `active` highlights
// the currently-selected filter.
function Tag({ label, active }: { label: string; active?: boolean }) {
  return (
    <a
      href={`#lab/t/${encodeURIComponent(label)}`}
      className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-[0.12em] uppercase transition-colors ${
        active
          ? "border-emerald-600 bg-emerald-600 text-white"
          : "border-black/10 bg-white/60 text-neutral-500 hover:border-emerald-500 hover:text-emerald-700"
      }`}
    >
      {label}
    </a>
  );
}

// Cover art for a post: a real image if `post.cover` is set, otherwise
// on-brand generated gradient art with a mono kicker label.
function Cover({ post, className }: { post: Post; className?: string }) {
  if (post.cover) {
    return (
      <img
        src={post.cover}
        alt=""
        className={`h-full w-full object-cover ${className ?? ""}`}
      />
    );
  }
  return (
    <div
      className={`relative flex h-full w-full items-end overflow-hidden ${className ?? ""}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${post.accent[0]} 0%, ${post.accent[1]} 100%)`,
      }}
    >
      {/* Soft grid + glow to give the flat gradient some texture. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-8 -right-6 h-28 w-28 rounded-full bg-white/40 blur-2xl"
      />
      <span className="relative m-3 font-mono text-[10px] tracking-[0.16em] text-white/90 uppercase drop-shadow-sm">
        {post.kicker}
      </span>
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-neutral-900">
      <AmbientBackground />
      <SiteHeader />
      <main className="relative z-[1] mx-auto max-w-4xl px-5 pt-28 pb-24 sm:px-8 sm:pt-32">
        {children}
      </main>
    </div>
  );
}

// --- Feed (index) ----------------------------------------------------------
function Feed({ activeTag }: { activeTag?: string }) {
  const visible = activeTag
    ? POSTS.filter((p) => p.tags.includes(activeTag))
    : POSTS;

  // Unique tags across all posts, in first-seen order, for the filter bar.
  const allTags = [...new Set(POSTS.flatMap((p) => p.tags))];

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(18,183,106,0.15)]" />
        <SectionLabel>04 / Lab</SectionLabel>
      </div>

      <p className="max-w-2xl text-[clamp(24px,4.5vw,40px)] leading-[1.15] font-normal text-neutral-500">
        Notes from the edge of what&apos;s new — GitHub, agent skills, and how I
        actually{" "}
        <span
          className="font-semibold text-neutral-900"
          style={{ fontFamily: '"Chakra Petch", sans-serif' }}
        >
          build with AI
        </span>
        .
      </p>

      {/* Tag filter bar — every tag across the feed, plus an "All" reset. */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <a
          href="#lab"
          className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-[0.12em] uppercase transition-colors ${
            activeTag
              ? "border-black/10 bg-white/60 text-neutral-500 hover:border-emerald-500 hover:text-emerald-700"
              : "border-emerald-600 bg-emerald-600 text-white"
          }`}
        >
          All
        </a>
        {allTags.map((t) => (
          <Tag key={t} label={t} active={t === activeTag} />
        ))}
      </div>

      {activeTag && (
        <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-[0.16em] uppercase">
          <span className="text-neutral-400">
            Filtered by{" "}
            <span className="text-emerald-600">{activeTag}</span> ·{" "}
            {visible.length} {visible.length === 1 ? "note" : "notes"}
          </span>
          <a
            href="#lab"
            className="text-neutral-900 underline-offset-4 hover:text-emerald-600 hover:underline"
          >
            Clear ✕
          </a>
        </div>
      )}

      <div className="mt-12 border-t border-black/10">
        {visible.map((post) => (
          <Reveal key={post.slug}>
            <div className="border-b border-black/10 py-8">
              <a
                href={`#lab/${post.slug}`}
                className="group flex cursor-pointer flex-col gap-4 sm:flex-row sm:gap-8"
              >
                <div className="aspect-[16/10] w-full overflow-hidden rounded-xl ring-1 ring-black/5 transition-transform group-hover:scale-[1.02] sm:aspect-auto sm:h-32 sm:w-52 sm:shrink-0">
                  <Cover post={post} />
                </div>
                <div className="flex-1">
                  <div className="font-mono text-[10px] tracking-[0.18em] text-black/45 uppercase">
                    {post.date} · {post.readTime}
                  </div>
                  <h2
                    className="mt-2 flex items-start gap-1.5 text-[22px] leading-tight font-semibold tracking-tight transition-colors group-hover:text-emerald-700"
                    style={{ fontFamily: '"Chakra Petch", sans-serif' }}
                  >
                    <span>{post.title}</span>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-neutral-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                  </h2>
                  <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-neutral-600">
                    {post.excerpt}
                  </p>
                </div>
              </a>
              {/* Tag chips sit outside the post link so they can be their own
                  filter links (no nested anchors). */}
              <div className="mt-4 flex flex-wrap items-center gap-2 sm:pl-60">
                {post.tags.map((t) => (
                  <Tag key={t} label={t} active={t === activeTag} />
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-6">
        <a
          href={`mailto:${EMAIL}`}
          className="group inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.2em] text-emerald-600 uppercase hover:text-emerald-700"
        >
          Talk shop with me
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
        <a
          href="#about"
          className="font-mono text-[11px] tracking-[0.2em] text-neutral-900 uppercase hover:text-emerald-600"
        >
          About me →
        </a>
      </div>
    </>
  );
}

// --- Post detail -----------------------------------------------------------
function PostDetail({ post }: { post: Post }) {
  return (
    <Reveal>
      <article className="max-w-2xl">
        <a
          href="#lab"
          className="group inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.2em] text-neutral-500 uppercase hover:text-emerald-700"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          All notes
        </a>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {post.tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
          <span className="font-mono text-[10px] tracking-[0.18em] text-black/45 uppercase">
            {post.date} · {post.readTime}
          </span>
        </div>

        <h1
          className="mt-5 text-[clamp(28px,5vw,44px)] leading-[1.08] font-bold tracking-tight"
          style={{ fontFamily: '"Chakra Petch", sans-serif' }}
        >
          {post.title}
        </h1>

        {/* Hero cover banner */}
        <div className="mt-8 aspect-[16/7] w-full overflow-hidden rounded-2xl ring-1 ring-black/5">
          <Cover post={post} />
        </div>

        <div className="mt-8 space-y-6">
          {post.body.map((para, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "text-[19px] leading-relaxed text-neutral-500"
                  : "text-[17px] leading-relaxed text-neutral-700"
              }
            >
              {para}
            </p>
          ))}
        </div>

        {/* Further reading — real, relevant links */}
        {post.links.length > 0 && (
          <div className="mt-12">
            <SectionLabel>Further reading</SectionLabel>
            <div className="grid gap-3 sm:grid-cols-2">
              {post.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white/60 px-4 py-3 backdrop-blur-xl transition-colors hover:border-emerald-500"
                >
                  <span className="text-[14px] font-medium text-neutral-700 group-hover:text-emerald-700">
                    {link.label}
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-6">
          <a
            href="#lab"
            className="group inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.2em] text-neutral-900 uppercase hover:text-emerald-600"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to all notes
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="group inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.2em] text-emerald-600 uppercase hover:text-emerald-700"
          >
            React to this
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </article>
    </Reveal>
  );
}

export function Lab() {
  const hash = useActiveHash();
  const rest = hash.startsWith("#lab/") ? hash.slice("#lab/".length) : "";

  // #lab/t/<tag> → filtered feed; #lab/<slug> → post detail; #lab → full feed.
  if (rest.startsWith("t/")) {
    const activeTag = decodeURIComponent(rest.slice("t/".length));
    return (
      <PageShell>
        <Feed activeTag={activeTag} />
      </PageShell>
    );
  }

  const post = POSTS.find((p) => p.slug === rest);
  return <PageShell>{post ? <PostDetail post={post} /> : <Feed />}</PageShell>;
}
