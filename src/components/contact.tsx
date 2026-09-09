import { ArrowUpRight, Check, Copy, Mail, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { AmbientBackground, PASTEL } from "@/components/ambient-background";
import { AriaConsole } from "@/components/aria-console";
import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { PastelGlassButton } from "@/components/ui/pastel-glass-button";

const EMAIL = "seetminyi.work@gmail.com";

// lucide-react dropped brand icons, so LinkedIn is a small inline glyph.
function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14M7.12 20.45H3.55V9h3.57zM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.75V1.75C24 .78 23.2 0 22.22 0" />
    </svg>
  );
}

// Where to find me.
const CHANNELS = [
  {
    icon: Mail,
    label: "Email",
    value: EMAIL,
    href: `mailto:${EMAIL}`,
    copy: true,
  },
  {
    icon: LinkedinIcon,
    label: "LinkedIn",
    value: "linkedin.com/in/seetminyi",
    href: "https://www.linkedin.com/in/seetminyi/",
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 font-mono text-[11px] tracking-[0.24em] text-emerald-600 uppercase">
      {children}
    </div>
  );
}

export function Contact() {
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localTime, setLocalTime] = useState("");

  const copyEmail = () => {
    navigator.clipboard?.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  // Live local clock — Singapore time (SGT).
  useEffect(() => {
    const tick = () =>
      setLocalTime(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Singapore",
        }).format(new Date()),
      );
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-neutral-900">
      <AmbientBackground />
      <SiteHeader />

      <main className="relative z-[1] mx-auto max-w-4xl px-5 pt-28 pb-24 sm:px-8 sm:pt-32">
        {/* Section marker */}
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(18,183,106,0.15)]" />
          <SectionLabel>04 / Contact</SectionLabel>
        </div>

        {/* Intro line */}
        <p className="max-w-2xl text-[clamp(24px,4.5vw,40px)] leading-[1.15] font-normal text-neutral-500">
          Open to freelance, contract, and interesting problems — tell me what
          you&apos;re building and you&apos;ll{" "}
          <span
            className="font-semibold text-neutral-900"
            style={{ fontFamily: '"Chakra Petch", sans-serif' }}
          >
            hear back within ~24 hours
          </span>
          .
        </p>

        <div className="mt-14 grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-8">
          {/* Left column — channels + where */}
          <div className="space-y-8">
            <Reveal>
              <section>
                <SectionLabel>Find me</SectionLabel>
                <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/60 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                  {CHANNELS.map((c, i) => {
                    const Icon = c.icon;
                    return (
                      <a
                        key={c.label}
                        href={c.href}
                        target={c.href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          c.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className={`group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/70 ${
                          i > 0 ? "border-t border-black/5" : ""
                        }`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white/70 text-neutral-700">
                          <Icon className="h-[18px] w-[18px]" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className="block text-[15px] font-semibold tracking-tight"
                            style={{ fontFamily: '"Chakra Petch", sans-serif' }}
                          >
                            {c.label}
                          </span>
                          <span className="block truncate font-mono text-[12px] tracking-[0.04em] text-neutral-500">
                            {c.value}
                          </span>
                        </span>
                        {c.copy ? (
                          <button
                            type="button"
                            aria-label="Copy email"
                            onClick={(e) => {
                              e.preventDefault();
                              copyEmail();
                            }}
                            className="shrink-0 rounded-lg p-1.5 text-neutral-400 transition-colors hover:text-neutral-900"
                          >
                            {copied ? (
                              <Check className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        )}
                      </a>
                    );
                  })}
                </div>
              </section>
            </Reveal>

            <Reveal>
              <section className="relative overflow-hidden rounded-2xl border border-white/70 bg-white/60 p-6 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-8 -right-6 h-24 w-24 rounded-full opacity-50 blur-2xl"
                  style={{ background: PASTEL }}
                />
                <div className="relative flex items-center justify-between gap-6">
                  <div>
                    <SectionLabel>Where</SectionLabel>
                    <div
                      className="text-[clamp(22px,4vw,30px)] leading-none font-bold tracking-tight"
                      style={{ fontFamily: '"Chakra Petch", sans-serif' }}
                    >
                      Singapore
                    </div>
                    <div className="mt-2 font-mono text-[11px] tracking-[0.16em] text-neutral-500 uppercase">
                      SGT · Remote-friendly
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-[clamp(22px,4vw,30px)] leading-none font-bold tracking-tight text-emerald-700"
                      style={{ fontFamily: '"Chakra Petch", sans-serif' }}
                    >
                      {localTime}
                    </div>
                    <div className="mt-2 font-mono text-[11px] tracking-[0.16em] text-neutral-500 uppercase">
                      My local time
                    </div>
                  </div>
                </div>
              </section>
            </Reveal>
          </div>

          {/* Right column — talk to A.R.I.A */}
          <Reveal>
            <section className="flex h-full flex-col rounded-2xl border border-white/70 bg-white/60 p-6 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.25)] backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span
                    className="text-[16px] font-semibold tracking-tight"
                    style={{ fontFamily: '"Chakra Petch", sans-serif' }}
                  >
                    Ask A.R.I.A
                  </span>
                </div>
                <span className="font-mono text-[10px] tracking-[0.18em] text-emerald-600 uppercase">
                  ~24h reply
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-black/5 bg-white/60 p-4">
                <p className="font-mono text-[11px] tracking-[0.12em] text-neutral-400 uppercase">
                  Min Yi&apos;s assistant
                </p>
                <p className="mt-2 text-[17px] leading-snug text-neutral-800">
                  Not sure what to send? Ask about the work, the projects, or the
                  best way to reach me.
                </p>
              </div>

              <div className="mt-4 flex-1" />

              <div className="mt-5">
                <PastelGlassButton
                  label="Start a conversation"
                  icon={<Sparkles className="h-4 w-4" />}
                  className="aurora-button--cta w-full"
                  onClick={() => setConsoleOpen(true)}
                />
              </div>
              <p className="mt-3 text-center font-mono text-[10px] tracking-[0.14em] text-neutral-400 uppercase">
                or email{" "}
                <a href={`mailto:${EMAIL}`} className="underline hover:text-neutral-700">
                  {EMAIL}
                </a>
              </p>
            </section>
          </Reveal>
        </div>

        {/* Footer nav */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-6">
          <a
            href="#about"
            className="font-mono text-[11px] tracking-[0.2em] text-neutral-500 uppercase hover:text-emerald-600"
          >
            ← About
          </a>
          <a
            href="#work"
            className="font-mono text-[11px] tracking-[0.2em] text-neutral-900 uppercase hover:text-emerald-600"
          >
            See the work →
          </a>
        </div>
      </main>

      <AriaConsole open={consoleOpen} onClose={() => setConsoleOpen(false)} />
    </div>
  );
}
