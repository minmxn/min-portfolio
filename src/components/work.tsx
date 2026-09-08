import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Clapperboard,
  MonitorSmartphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

const EMAIL = "seetminyi.work@gmail.com";

type CareerItem = {
  period: string;
  title: string;
  org: string;
  current?: boolean;
};

// Real career history (from LinkedIn), most recent first.
const CAREER: CareerItem[] = [
  {
    period: "Jun 2026 - Now",
    title: "Senior Business Architecture Analyst",
    org: "Accenture · Full-time",
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

type WorkItem = {
  index: string;
  category: string;
  status: string;
  name: string;
  description: string;
  tags: string[];
  href?: string;
  /** Optional screenshot/still. Drop files in public/work/ and set the path. */
  image?: string;
  icon: LucideIcon;
};

const SELECTED_WORK: WorkItem[] = [
  {
    index: "01",
    category: "Product",
    status: "Live",
    name: "Nomo News Bot",
    description:
      "A Telegram bot delivering a calm, AI-summarized daily news digest: morning briefing, poll, quiz, and a swipeable reader. Designed, built, and operated end to end.",
    tags: ["AI Product", "Node.js", "Telegram"],
    href: "#nomo",
    image: "/work/nomo-briefing.png",
    icon: Bot,
  },
  {
    index: "02",
    category: "Generative AI",
    status: "Experiment",
    name: "The Little Prince",
    description:
      "A painterly clip made with Kling 3.0, treating character consistency as a product-thinking exercise, not just a demo.",
    tags: ["Kling 3.0", "Direction", "Video"],
    href: "#kling",
    image: "/work/kling-prince-front.png",
    icon: Clapperboard,
  },
  {
    index: "03",
    category: "Web",
    status: "Live",
    name: "This Portfolio",
    description:
      "The site you're reading: a React 19 + Vite build with a mouse-scrubbed character, a glass A.R.I.A console, and this very work index.",
    tags: ["React", "Vite", "Tailwind"],
    href: "#home",
    icon: MonitorSmartphone,
  },
];

const MARQUEE = [
  "Business Analysis",
  "Requirements",
  "UAT",
  "Stakeholder Mgmt",
  "Agile Delivery",
  "Node.js",
  "LLM Integration",
  "APIs",
  "Prompt Engineering",
  "Oracle Cloud",
];

export function Work() {
  return (
    <div className="relative min-h-screen bg-white text-neutral-900">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-5 pt-28 pb-32 sm:px-8 sm:pt-32">
        {/* Section intro */}
        <div className="mb-14 max-w-2xl">
          <div className="mb-4 font-mono text-[11px] tracking-[0.28em] text-emerald-600 uppercase">
            02 / Work
          </div>
          <p className="text-[clamp(22px,4vw,34px)] leading-tight font-normal text-neutral-500">
            <span className="font-medium text-neutral-900">At Accenture,</span>{" "}
            I turn tangled, multi-stakeholder requirements into software teams
            can actually ship.{" "}
            <span className="font-medium text-neutral-900">On my own time,</span>{" "}
            I build products that prove the thinking.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] tracking-[0.22em] text-neutral-400 uppercase">
            <span>$5M+ Portfolio</span>
            <span className="text-emerald-500">·</span>
            <span>Agile Delivery</span>
            <span className="text-emerald-500">·</span>
            <span>Public Sector Platforms</span>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: career timeline */}
          <section>
            <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-2">
              <span className="font-mono text-[11px] tracking-[0.24em] text-black/50 uppercase">
                Career
              </span>
              <span className="font-mono text-[11px] tracking-[0.24em] text-black/30">
                {String(CAREER.length).padStart(2, "0")}
              </span>
            </div>

            <ol className="relative ml-1 border-l border-black/10">
              {CAREER.map((item) => (
                <li key={item.period} className="relative mb-8 pl-6 last:mb-0">
                  <span
                    className={`absolute top-1 -left-[5px] h-2.5 w-2.5 rounded-full ${
                      item.current
                        ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(18,183,106,0.15)]"
                        : "bg-neutral-300"
                    }`}
                  />
                  <div className="font-mono text-[10px] tracking-[0.2em] text-black/40 uppercase">
                    {item.period}
                  </div>
                  <div
                    className="mt-1 text-[19px] font-semibold tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.title}
                  </div>
                  <div className="text-[14px] text-neutral-500">{item.org}</div>
                </li>
              ))}
            </ol>
          </section>

          {/* Right: selected work */}
          <section>
            <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-2">
              <span className="font-mono text-[11px] tracking-[0.24em] text-black/50 uppercase">
                Personal Projects
              </span>
              <span className="font-mono text-[11px] tracking-[0.24em] text-black/30">
                {String(SELECTED_WORK.length).padStart(2, "0")}
              </span>
            </div>

            <div className="flex flex-col gap-5">
              {SELECTED_WORK.map((item) => {
                const Icon = item.icon;
                const external = item.href?.startsWith("http");
                const CardTag = item.href ? "a" : "div";
                return (
                  <CardTag
                    key={item.index}
                    {...(item.href
                      ? {
                          href: item.href,
                          ...(external
                            ? { target: "_blank", rel: "noreferrer" }
                            : {}),
                        }
                      : {})}
                    className={`group relative flex gap-4 overflow-hidden rounded-2xl border border-black/10 bg-white p-4 transition-shadow sm:gap-5 sm:p-5 ${
                      item.href
                        ? "hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)]"
                        : ""
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-black/5 bg-neutral-100 sm:h-28 sm:w-28">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-200">
                          <Icon
                            className="h-8 w-8 text-neutral-400 transition-colors group-hover:text-emerald-600"
                            strokeWidth={1.4}
                          />
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] tracking-[0.2em] text-black/45 uppercase">
                          {item.index} · {item.category}
                        </span>
                        <span className="font-mono text-[10px] tracking-[0.2em] text-emerald-600 uppercase">
                          {item.status}
                        </span>
                      </div>
                      <h3
                        className="mt-1.5 flex items-center gap-1.5 text-[20px] font-semibold tracking-tight"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {item.name}
                        {item.href &&
                          (external ? (
                            <ArrowUpRight className="h-4 w-4 text-neutral-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                          ) : (
                            <ArrowRight className="h-4 w-4 text-neutral-400 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                          ))}
                      </h3>
                      <p className="mt-1 text-[14px] leading-relaxed text-neutral-500">
                        {item.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-black/10 bg-white px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-black/55 uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardTag>
                );
              })}
            </div>
          </section>
        </div>

        {/* Closing CTA */}
        <div className="mt-20 flex flex-col items-start gap-5 border-t border-black/10 pt-12 sm:mt-24 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className="text-[clamp(22px,4vw,30px)] font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Like what you see?
            </p>
            <p className="mt-1 text-[15px] text-neutral-500">
              Open to product roles and building useful things together.
            </p>
          </div>
          <a
            href={`mailto:${EMAIL}`}
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-emerald-600"
          >
            Let&apos;s talk
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </main>

      {/* Bottom skills marquee */}
      <div className="fixed inset-x-0 bottom-0 z-10 flex items-center border-t border-black/10 bg-white/80 py-3 backdrop-blur-md">
        <span className="shrink-0 px-5 font-mono text-[11px] tracking-[0.2em] text-neutral-900 uppercase sm:px-8">
          Toolkit
        </span>
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <div className="marquee-track font-mono text-[11px] tracking-[0.18em] whitespace-nowrap text-neutral-400 uppercase">
            {[...MARQUEE, ...MARQUEE].map((skill, i) => (
              <span key={i} className="flex items-center">
                {skill}
                <span className="mx-4 text-emerald-500">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
