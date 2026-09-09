import { ArrowUpRight } from "lucide-react";
import { AmbientBackground, PASTEL } from "@/components/ambient-background";
import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";

const EMAIL = "seetminyi.work@gmail.com";

// How I work — approach, not a resume dump. Edit freely.
const APPROACH = [
  {
    title: "Translate before I build",
    body: "I sit between stakeholders and engineering and turn tangled, multi-stakeholder requirements into something a team can actually ship.",
  },
  {
    title: "Sweat the boring middle",
    body: "The requirements nobody wants to write, the edge case that only shows up in production, the fallback that saves someone from a blank screen.",
  },
  {
    title: "Prove the thinking by shipping",
    body: "I build my own products end to end — design, code, and run them in production — so ideas hold up all the way to something real.",
  },
];

// By-the-numbers cards. Confirm/adjust these figures before publishing.
const STATS = [
  { value: "5+", label: "Years in delivery" },
  { value: "$5M+", label: "Portfolio delivered" },
  { value: "Live", label: "Products in production" },
];

// Career trajectory (mirrors the Work page's timeline, newest first).
const TRAJECTORY = [
  {
    period: "Jun 2026 - Now",
    title: "Senior Business Architecture Analyst",
    org: "Accenture",
    current: true,
  },
  {
    period: "Sep 2024 - May 2026",
    title: "Business Architecture Analyst",
    org: "Accenture",
  },
  {
    period: "Aug 2023 - Sep 2024",
    title: "Functional Analyst",
    org: "Accenture · Internship",
  },
  {
    period: "Apr 2019 - Sep 2019",
    title: "Software Engineer",
    org: "Accenture · Internship",
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 font-mono text-[11px] tracking-[0.24em] text-emerald-600 uppercase">
      {children}
    </div>
  );
}

export function About() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-neutral-900">
      <AmbientBackground />
      <SiteHeader />

      <main className="relative z-[1] mx-auto max-w-4xl px-5 pt-28 pb-24 sm:px-8 sm:pt-32">
        {/* Section marker */}
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(18,183,106,0.15)]" />
          <SectionLabel>03 / About</SectionLabel>
        </div>

        {/* Intro line */}
        <p className="max-w-2xl text-[clamp(24px,4.5vw,40px)] leading-[1.15] font-normal text-neutral-500">
          The person behind the systems — turning tangled, multi-stakeholder
          requirements into products people actually{" "}
          <span
            className="font-semibold text-neutral-900"
            style={{ fontFamily: '"Chakra Petch", sans-serif' }}
          >
            trust
          </span>
          .
        </p>

        {/* Name + role + bio */}
        <Reveal>
          <section className="mt-14">
            <h1
              className="text-[clamp(34px,7vw,60px)] leading-[1.02] font-bold tracking-tight"
              style={{ fontFamily: '"Chakra Petch", sans-serif' }}
            >
              Seet Min Yi.
            </h1>
            <div className="mt-3 font-mono text-[11px] tracking-[0.24em] text-emerald-600 uppercase sm:text-[13px]">
              Business Analyst · Product Thinker · Accenture
            </div>
            <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-neutral-600">
              I&apos;m a business analyst at Accenture, where I sit between
              stakeholders and engineering teams and make sure what gets built
              is the thing that was actually needed. On my own time I design and
              ship products end to end — most recently Nomo, an AI news
              companion I run in production every day.
            </p>
          </section>
        </Reveal>

        {/* By the numbers */}
        <Reveal>
          <section className="mt-14">
            <SectionLabel>By the numbers</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-3">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/60 p-6 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.25)] backdrop-blur-xl"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-8 -right-6 h-24 w-24 rounded-full opacity-50 blur-2xl"
                    style={{ background: PASTEL }}
                  />
                  <div
                    className="relative text-[clamp(30px,5vw,44px)] leading-none font-bold tracking-tight text-emerald-700"
                    style={{ fontFamily: '"Chakra Petch", sans-serif' }}
                  >
                    {s.value}
                  </div>
                  <div className="relative mt-3 font-mono text-[11px] tracking-[0.16em] text-neutral-500 uppercase">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* How I work */}
        <Reveal>
          <section className="mt-14">
            <SectionLabel>How I work</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-3">
              {APPROACH.map((a) => (
                <div
                  key={a.title}
                  className="rounded-2xl border border-black/10 bg-white/60 p-6 backdrop-blur-xl"
                >
                  <div
                    className="text-[16px] leading-tight font-semibold tracking-tight"
                    style={{ fontFamily: '"Chakra Petch", sans-serif' }}
                  >
                    {a.title}
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-neutral-600">
                    {a.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Manifesto */}
        <Reveal>
          <section className="mt-14 max-w-2xl">
            <SectionLabel>Manifesto</SectionLabel>
            <p className="text-[17px] leading-relaxed text-neutral-600">
              Good software is a form of respect: it takes the messy, human
              problem seriously and hides none of that work in the seams. I care
              about the boring middle — the requirements nobody wants to write,
              the edge case that only shows up in production, the fallback that
              keeps someone from hitting a blank screen. When I&apos;m not
              translating between people and systems at work, I build my own to
              prove the thinking holds up all the way to shipped.
            </p>
          </section>
        </Reveal>

        {/* Trajectory */}
        <Reveal>
          <section className="mt-14">
            <SectionLabel>Trajectory</SectionLabel>
            <div className="border-t border-black/10">
              {TRAJECTORY.map((item) => (
                <div
                  key={item.period}
                  className="flex flex-col gap-1 border-b border-black/10 py-5 sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <div className="flex items-center gap-2 sm:w-44 sm:shrink-0">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        item.current ? "bg-emerald-500" : "bg-neutral-300"
                      }`}
                    />
                    <span className="font-mono text-[10px] tracking-[0.18em] text-black/45 uppercase">
                      {item.period}
                    </span>
                  </div>
                  <div>
                    <div
                      className="text-[16px] leading-tight font-semibold tracking-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item.title}
                    </div>
                    <div className="mt-0.5 text-[13px] text-neutral-500">
                      {item.org}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Beyond work */}
        <Reveal>
          <section className="mt-14 max-w-2xl">
            <SectionLabel>Beyond work</SectionLabel>
            <p className="text-[17px] leading-relaxed text-neutral-600">
              I keep a close eye on markets, world, and tech news — enough that I
              built Nomo to feed my friends&apos; group chat a calmer daily
              digest. I like tinkering at the edges of what&apos;s new, from
              generative video to whatever tool just dropped, and turning the
              interesting bits into small things I can actually ship.
            </p>
          </section>
        </Reveal>

        {/* Footer CTA */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-6">
          <a
            href={`mailto:${EMAIL}`}
            className="group inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.2em] text-emerald-600 uppercase hover:text-emerald-700"
          >
            Get in touch
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <a
            href="#work"
            className="font-mono text-[11px] tracking-[0.2em] text-neutral-900 uppercase hover:text-emerald-600"
          >
            See the work →
          </a>
        </div>
      </main>
    </div>
  );
}
