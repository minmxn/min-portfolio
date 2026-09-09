import { ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { AmbientBackground, PASTEL } from "@/components/ambient-background";
import { SiteHeader } from "@/components/site-header";
import { FeatureCarousel } from "@/components/ui/feature-carousel";

// Scroll-reveal: fade + rise each section as it enters the viewport.
const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

/* ---- data (same content as the live Work page) ---------------------- */

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
    <div className="relative min-h-screen overflow-hidden bg-white text-neutral-900">
      <AmbientBackground />

      <SiteHeader />

      <main className="relative z-[1] mx-auto max-w-6xl px-5 pt-28 pb-32 sm:px-8 sm:pt-32">
        {/* (5) Intro hero band on a glass panel */}
        <motion.section
          {...reveal}
          className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/60 p-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-12"
        >
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
        </motion.section>

        {/* Personal Projects — carousel */}
        <motion.section {...reveal} className="mt-16">
          <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-2">
            <span className="font-mono text-[11px] tracking-[0.24em] text-black/50 uppercase">
              Personal Projects
            </span>
            <span className="font-mono text-[11px] tracking-[0.24em] text-black/30">
              03
            </span>
          </div>

          <FeatureCarousel />
        </motion.section>

        {/* Closing CTA */}
        <motion.section
          {...reveal}
          className="mt-20 overflow-hidden rounded-3xl border border-white/70 bg-neutral-900 p-8 sm:p-12"
        >
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
        </motion.section>
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
