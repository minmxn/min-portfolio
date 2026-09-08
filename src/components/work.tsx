import { ArrowRight, ArrowUpRight, MonitorSmartphone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

/* ---- data (same content as the live Work page) ---------------------- */

type CareerItem = {
  period: string;
  title: string;
  org: string;
  current?: boolean;
};

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

type Project = {
  index: string;
  category: string;
  status: "Live" | "Experiment";
  name: string;
  description: string;
  tags: string[];
  href: string;
  external?: boolean;
  image?: string;
  /** "cover" (default) fills the frame; "contain" fits a logo without cropping. */
  imageFit?: "cover" | "contain";
};

const PROJECTS: Project[] = [
  {
    index: "01",
    category: "Product",
    status: "Live",
    name: "Nomo News Bot",
    description:
      "An AI news companion in Telegram: morning briefing, poll, quiz, and a swipeable reader. Designed, built, and run in production.",
    tags: ["AI Product", "Node.js", "Telegram"],
    href: "#nomo",
    image: "/work/nomo-logo.webp",
    imageFit: "contain",
  },
  {
    index: "02",
    category: "Generative AI",
    status: "Experiment",
    name: "The Little Prince",
    description:
      "A painterly clip made with Kling 3.0, treating character consistency as a product-thinking exercise.",
    tags: ["Kling 3.0", "Direction", "Video"],
    href: "#kling",
    image: "/work/kling-prince-front.webp",
  },
  {
    index: "03",
    category: "Web",
    status: "Live",
    name: "This Portfolio",
    description:
      "The site you're reading: a React 19 + Vite build with a mouse-scrubbed character and a glass A.R.I.A console.",
    tags: ["React", "Vite", "Tailwind"],
    href: "#home",
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

const PASTEL =
  "conic-gradient(from 0deg, #ffd1dc, #ffe0b3, #fff5ba, #c8f7d4, #b3e5ff, #d7c9ff, #ffd1dc)";

function StatusPill({ status }: { status: Project["status"] }) {
  const styles =
    status === "Live"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[9px] tracking-[0.16em] uppercase ${styles}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${status === "Live" ? "bg-emerald-500" : "bg-amber-500"}`}
      />
      {status}
    </span>
  );
}

export function Work() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-neutral-900">
      {/* (1) Ambient background: dot grid + soft pastel glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.10) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 -right-32 z-0 h-[32rem] w-[32rem] rounded-full opacity-40 blur-[90px]"
        style={{ background: PASTEL }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-48 -left-40 z-0 h-[30rem] w-[30rem] rounded-full opacity-30 blur-[100px]"
        style={{ background: PASTEL }}
      />

      <SiteHeader />

      <main className="relative z-[1] mx-auto max-w-6xl px-5 pt-28 pb-32 sm:px-8 sm:pt-32">
        {/* (5) Intro hero band on a glass panel */}
        <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/60 p-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-10 h-52 w-52 rounded-full opacity-50 blur-3xl"
            style={{ background: PASTEL }}
          />
          <div className="relative max-w-2xl">
            <div className="mb-4 font-mono text-[11px] tracking-[0.28em] text-emerald-600 uppercase">
              02 / Work
            </div>
            <p className="text-[clamp(24px,4.5vw,40px)] leading-[1.1] font-normal text-neutral-500">
              <span
                className="font-semibold text-neutral-900"
                style={{ fontFamily: '"Chakra Petch", sans-serif' }}
              >
                At Accenture,
              </span>{" "}
              I turn tangled, multi-stakeholder requirements into software teams
              can actually ship.{" "}
              <span
                className="font-semibold text-neutral-900"
                style={{ fontFamily: '"Chakra Petch", sans-serif' }}
              >
                On my own time,
              </span>{" "}
              I build products that prove the thinking.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["$5M+ Portfolio", "Agile Delivery", "Public Sector"].map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-black/10 bg-white/70 px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-neutral-600 uppercase"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* (6) Career — current role gets an emerald card */}
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-2">
            <span className="font-mono text-[11px] tracking-[0.24em] text-black/50 uppercase">
              Career
            </span>
            <span className="font-mono text-[11px] tracking-[0.24em] text-black/30">
              04
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CAREER.map((item) => (
              <div
                key={item.period}
                className={`rounded-2xl border p-5 transition-shadow ${
                  item.current
                    ? "border-emerald-200 bg-emerald-50/80 shadow-[0_20px_40px_-24px_rgba(16,185,129,0.5)]"
                    : "border-black/10 bg-white/70"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      item.current
                        ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]"
                        : "bg-neutral-300"
                    }`}
                  />
                  <span className="font-mono text-[10px] tracking-[0.18em] text-black/45 uppercase">
                    {item.period}
                  </span>
                </div>
                <div
                  className="mt-3 text-[16px] leading-tight font-semibold tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.title}
                </div>
                <div className="mt-1 text-[13px] text-neutral-500">
                  {item.org}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* (2)(3)(4) Personal Projects — image-forward cards */}
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-2">
            <span className="font-mono text-[11px] tracking-[0.24em] text-black/50 uppercase">
              Personal Projects
            </span>
            <span className="font-mono text-[11px] tracking-[0.24em] text-black/30">
              03
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((p) => {
              const external = p.href.startsWith("http");
              return (
                <a
                  key={p.index}
                  href={p.href}
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.3)]"
                >
                  {/* Image / placeholder */}
                  <div
                    className={`relative aspect-[4/3] overflow-hidden ${
                      p.imageFit === "contain" ? "bg-white" : "bg-neutral-100"
                    }`}
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${
                          p.imageFit === "contain"
                            ? "object-contain p-6"
                            : "object-cover object-center"
                        }`}
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center"
                        style={{ background: PASTEL, opacity: 0.85 }}
                      >
                        <MonitorSmartphone
                          className="h-10 w-10 text-white/90"
                          strokeWidth={1.4}
                        />
                      </div>
                    )}
                    {/* (4) big editorial index */}
                    <span
                      className="absolute top-2 left-3 text-[44px] leading-none font-bold text-white/80 mix-blend-overlay"
                      style={{ fontFamily: '"Chakra Petch", sans-serif' }}
                    >
                      {p.index}
                    </span>
                    {/* (3) colored status pill */}
                    <span className="absolute top-3 right-3">
                      <StatusPill status={p.status} />
                    </span>
                  </div>

                  {/* Text */}
                  <div className="flex flex-1 flex-col p-5">
                    <span className="font-mono text-[10px] tracking-[0.2em] text-black/45 uppercase">
                      {p.index} · {p.category}
                    </span>
                    <h3
                      className="mt-1.5 flex items-center gap-1.5 text-[20px] font-semibold tracking-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {p.name}
                      {external ? (
                        <ArrowUpRight className="h-4 w-4 text-neutral-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                      ) : (
                        <ArrowRight className="h-4 w-4 text-neutral-400 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                      )}
                    </h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">
                      {p.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5 pt-1">
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-black/10 bg-white px-2.5 py-1 font-mono text-[9px] tracking-[0.12em] text-black/55 uppercase"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mt-20 overflow-hidden rounded-3xl border border-white/70 bg-neutral-900 p-8 sm:p-12">
          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className="text-[clamp(22px,4vw,32px)] font-semibold tracking-tight text-white"
                style={{ fontFamily: '"Chakra Petch", sans-serif' }}
              >
                Like what you see?
              </p>
              <p className="mt-1 text-[15px] text-neutral-400">
                Open to product roles and building useful things together.
              </p>
            </div>
            <a
              href="mailto:seetminyi.work@gmail.com"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-medium text-neutral-900 transition-colors hover:bg-emerald-400 hover:text-white"
            >
              Let&apos;s talk
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </section>
      </main>

      {/* Toolkit marquee */}
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
