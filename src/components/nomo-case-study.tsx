import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { AmbientBackground } from "@/components/ambient-background";
import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";

const BOT_URL = "https://t.me/nomogh_bot";

const META = [
  { label: "Role", value: "Product, engineering & ops (solo)" },
  { label: "Status", value: "Live daily in production" },
  { label: "Cost to run", value: "$0 (free-tier infra)" },
];

const STACK = [
  "Node.js",
  "Telegram Bot API",
  "Groq LLM",
  "NewsAPI",
  "Tavily",
  "Oracle Cloud",
  "PM2",
];

const SHOTS = [
  {
    src: "/work/nomo-briefing.png",
    caption: "The 8am morning briefing: the day's key stories, summarized.",
  },
  {
    src: "/work/nomo-news.png",
    caption: "The swipeable news reader, refreshed several times a day.",
  },
  {
    src: "/work/nomo-quiz.png",
    caption: "A daily quiz that makes keeping up feel interactive.",
  },
];

const DOES = [
  "A morning briefing that summarizes the day's key stories",
  "A daily poll and a short quiz that make the news interactive",
  "A swipeable news reader you tap through, refreshed several times a day",
  "A free-text question feature that answers current questions using live web search",
];

const DECISIONS = [
  "Met users where they already are (Telegram) instead of building a separate app, and cut an earlier web reader to keep the experience purely in chat and cheaper to run.",
  "Designed the daily schedule as an experience (briefing, then poll, then quiz, then readers) rather than a firehose of alerts.",
  "Built entirely on free tiers, which forced real prioritization. To stay under a 100-call-per-day news quota, I combined three queries into one and added caching.",
  "Designed for graceful degradation: when the AI hits rate limits, the bot silently falls back to simpler content, so users are never left with a blank screen.",
  "Migrated hosting from a paid platform to Oracle Cloud's free tier to cut cost to zero, and learned production operations along the way (process management, auto-restart on reboot, remote deploys).",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 font-mono text-[11px] tracking-[0.24em] text-emerald-600 uppercase">
      {children}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[16px] leading-relaxed text-neutral-600">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function NomoCaseStudy() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-neutral-900">
      <AmbientBackground />
      <SiteHeader />

      <main className="relative z-[1] mx-auto max-w-4xl px-5 pt-28 pb-24 sm:px-8 sm:pt-32">
        <a
          href="#work"
          className="group mb-8 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.2em] text-neutral-400 uppercase transition-colors hover:text-neutral-900"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Personal Projects
        </a>

        {/* Title */}
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(18,183,106,0.15)]" />
          <SectionLabel>Case Study · Product</SectionLabel>
        </div>
        <h1
          className="text-[clamp(30px,6vw,52px)] leading-[1.05] font-bold tracking-tight"
          style={{ fontFamily: '"Chakra Petch", sans-serif' }}
        >
          Nomo News Bot
        </h1>
        <p className="mt-3 max-w-xl text-[clamp(16px,2.5vw,20px)] text-neutral-500">
          An AI news companion I designed, built, and run in production every
          day.
        </p>

        {/* Meta */}
        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-black/10 pt-5">
          {META.map((m) => (
            <div key={m.label}>
              <div className="font-mono text-[10px] tracking-[0.2em] text-black/40 uppercase">
                {m.label}
              </div>
              <div className="mt-1 text-[15px] font-medium">{m.value}</div>
            </div>
          ))}
        </div>

        {/* Stack + CTA */}
        <div className="mt-5 flex flex-wrap items-center gap-2 border-b border-black/10 pb-6">
          {STACK.map((s) => (
            <span
              key={s}
              className="rounded-full border border-black/10 bg-white px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-black/55 uppercase"
            >
              {s}
            </span>
          ))}
          <a
            href={BOT_URL}
            target="_blank"
            rel="noreferrer"
            className="group ml-auto inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-emerald-600"
          >
            Try the bot
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* Screenshots */}
        <Reveal><section className="mt-10">
          <div className="grid gap-4 sm:grid-cols-3">
            {SHOTS.map((shot) => (
              <figure key={shot.src}>
                <div className="overflow-hidden rounded-xl border border-black/10 bg-neutral-100">
                  <img
                    src={shot.src}
                    alt={shot.caption}
                    loading="lazy"
                    className="w-full object-cover"
                  />
                </div>
                <figcaption className="mt-2 text-[13px] leading-snug text-neutral-500">
                  {shot.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section></Reveal>

        {/* The problem */}
        <Reveal><section className="mt-16 max-w-2xl">
          <SectionLabel>The problem</SectionLabel>
          <p className="text-[17px] leading-relaxed text-neutral-600">
            My friends and I (a group we call Market Kakis) wanted to keep up
            with markets, world, and tech news without drowning in noise or doom
            scrolling. General news apps hand you everything and prioritize
            nothing, so staying informed felt like a chore.
          </p>
        </section></Reveal>

        {/* The idea */}
        <Reveal><section className="mt-14 max-w-2xl">
          <SectionLabel>The idea</SectionLabel>
          <p className="text-[17px] leading-relaxed text-neutral-600">
            Deliver a small, curated, AI-summarized digest inside a chat app
            people already open all day. No new app to install and no new habit
            to build. The news comes to you, in Telegram, on a calm daily
            rhythm.
          </p>
        </section></Reveal>

        {/* What it does */}
        <Reveal><section className="mt-14 max-w-2xl">
          <SectionLabel>What it does</SectionLabel>
          <Bullets items={DOES} />
        </section></Reveal>

        {/* How it works */}
        <Reveal><section className="mt-14 max-w-2xl">
          <SectionLabel>How it works</SectionLabel>
          <p className="text-[17px] leading-relaxed text-neutral-600">
            A cron schedule posts on a calm daily rhythm (Singapore time): an 8am
            briefing, a 9am poll, a 10am quiz, then swipeable news readers at
            noon, 3pm, 6pm, and 8pm. Each post pulls one combined NewsAPI query,
            filters low-quality sources, and hands the rest to a Groq model for
            summaries. A retry-on-rate-limit wrapper rides out bursts, and every
            AI feature has a silent fallback so the bot never posts a blank
            screen.
          </p>
        </section></Reveal>

        {/* Product decisions */}
        <Reveal><section className="mt-14 max-w-2xl">
          <SectionLabel>Product decisions & tradeoffs</SectionLabel>
          <Bullets items={DECISIONS} />
        </section></Reveal>

        {/* Outcome */}
        <Reveal><section className="mt-14 max-w-2xl">
          <SectionLabel>Outcome & learnings</SectionLabel>
          <p className="text-[17px] leading-relaxed text-neutral-600">
            Nomo has run daily for a real audience since launch. Building it
            taught me to treat cost and quotas as product constraints, to scope
            ruthlessly, and to design for failure so the experience stays intact.
            It gave me a concrete, shipped example of the product thinking I want
            to bring to a team.
          </p>
        </section></Reveal>

        {/* What's next */}
        <Reveal><section className="mt-14 max-w-2xl">
          <SectionLabel>What is next</SectionLabel>
          <p className="text-[17px] leading-relaxed text-neutral-600">
            Add lightweight usage analytics so decisions are driven by data
            rather than guesses, and broaden the range of trusted sources.
          </p>
        </section></Reveal>

        {/* Next project */}
        <Reveal><a
          href="#kling"
          className="group mt-16 flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-neutral-50 p-6 transition-colors hover:border-emerald-500/40 hover:bg-emerald-50/40"
        >
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] text-black/40 uppercase">
              Next project
            </div>
            <div
              className="mt-1 text-[20px] font-semibold tracking-tight"
              style={{ fontFamily: '"Chakra Petch", sans-serif' }}
            >
              The Little Prince
            </div>
            <div className="mt-0.5 text-[14px] text-neutral-500">
              A painterly generative-video clip made with Kling 3.0.
            </div>
          </div>
          <ArrowUpRight className="h-6 w-6 shrink-0 text-neutral-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-600" />
        </a></Reveal>

        {/* Footer */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-6">
          <a
            href={BOT_URL}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.2em] text-emerald-600 uppercase hover:text-emerald-700"
          >
            Try Nomo on Telegram
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <a
            href="#work"
            className="font-mono text-[11px] tracking-[0.2em] text-neutral-900 uppercase hover:text-emerald-600"
          >
            ← Back to work
          </a>
        </div>
      </main>
    </div>
  );
}
