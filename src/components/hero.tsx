import { Check, Copy, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { PastelGlassButton } from "@/components/ui/pastel-glass-button";
import { TypewriterHeading } from "@/components/typewriter-heading";
import { useScrubVideo } from "@/hooks/use-scrub-video";

const NAV_LINKS = ["Labs", "Studio", "Openings", "Shop"];
const ACTION_PILLS = [
  "Pitch us an idea",
  "Come work here",
  "Send a brief hello",
  "See how we operate",
];
const EMAIL = "hello@mainframe.co";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  useScrubVideo(videoRef);

  const copyEmail = () => {
    navigator.clipboard?.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-neutral-900">
      {/* Character video (mouse-scrubbed) */}
      <video
        ref={videoRef}
        src="/girl_animation.mp4"
        muted
        playsInline
        preload="auto"
        className="pointer-events-none fixed top-0 left-[12vw] z-0 h-full w-[77vw] translate-y-[2%] object-contain"
      />

      {/* Top nav */}
      <nav className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span
            className="text-[21px] font-medium tracking-tight sm:text-[26px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Mainframe®
          </span>
          <span className="text-[25px] leading-none select-none sm:text-[30px]">✳︎</span>
        </div>

        <div className="hidden items-center text-[23px] md:flex">
          {NAV_LINKS.map((link, i) => (
            <span key={link}>
              <a href="#" className="transition-opacity hover:opacity-60">
                {link}
              </a>
              {i < NAV_LINKS.length - 1 && <span>,&nbsp;</span>}
            </span>
          ))}
        </div>

        <button
          type="button"
          aria-label="Menu"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex flex-col gap-[5px] p-2 md:hidden"
        >
          <span
            className={`h-0.5 w-6 bg-black transition-all ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span className={`h-0.5 w-6 bg-black transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span
            className={`h-0.5 w-6 bg-black transition-all ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile overlay menu */}
      <div
        className={`fixed inset-0 z-10 flex flex-col items-start justify-center gap-8 bg-white/95 px-8 backdrop-blur-sm transition-opacity md:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href="#"
            onClick={() => setMenuOpen(false)}
            className="text-[32px] font-medium"
          >
            {link}
          </a>
        ))}
        <a
          href="#"
          onClick={() => setMenuOpen(false)}
          className="text-[32px] font-medium underline underline-offset-2"
        >
          Get in touch
        </a>
      </div>

      {/* Hero content */}
      <section className="relative z-[1] flex min-h-screen flex-col justify-end px-5 pb-12 sm:px-8 md:justify-center md:px-10">
        <div className="relative z-10 max-w-xl">
          <div className="mb-3.5 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] text-black/55 uppercase">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(18,183,106,0.15)]" />
            <span>a.r.i.a · online</span>
          </div>

          <p className="mb-5 text-[clamp(18px,4vw,26px)] leading-tight sm:mb-6">
            Hey there, meet A.R.I.A,
            <br />
            Mainframe&apos;s Adaptive Response Interface Agent
          </p>

          <TypewriterHeading
            startDelay={500}
            speed={38}
            className="mb-6 min-h-[54px] max-w-xl text-[clamp(18px,4vw,26px)] leading-snug font-normal text-black sm:mb-7"
          />

          {/* Primary CTA — pastel glass */}
          <div className="mb-4">
            <PastelGlassButton
              label="Ask agents"
              icon={<Sparkles className="h-4 w-4" />}
              className="aurora-button--cta"
              onClick={() => {
                document
                  .getElementById("actions")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </div>

          {/* Action pills */}
          <div id="actions" className="flex flex-wrap gap-y-1.5">
            {ACTION_PILLS.map((pill) => (
              <a
                key={pill}
                href="#"
                className="mx-[3px] mb-1.5 inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-[0.3em] text-[13px] whitespace-nowrap text-black transition-colors hover:bg-black hover:text-white sm:px-5 sm:text-[15px]"
              >
                {pill}
              </a>
            ))}
            <button
              type="button"
              onClick={copyEmail}
              className="mx-[3px] mb-1.5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-transparent px-4 py-[0.3em] text-[13px] whitespace-nowrap text-black transition-colors hover:bg-black hover:text-white sm:px-5 sm:text-[15px]"
            >
              <span>
                Reach us:{" "}
                <span className="underline underline-offset-1">{EMAIL}</span>
              </span>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </section>

      {/* Dev-only: jump to the button reference gallery */}
      <a
        href="#buttons"
        className="fixed right-4 bottom-4 z-30 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 font-mono text-[10px] tracking-widest text-black/50 uppercase backdrop-blur-sm transition-colors hover:text-black"
      >
        View button gallery →
      </a>
    </div>
  );
}
