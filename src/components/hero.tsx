import { Check, Copy, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { PastelGlassButton } from "@/components/ui/pastel-glass-button";
import { AriaConsole } from "@/components/aria-console";
import { TopNav } from "@/components/top-nav";
import { TypewriterHeading } from "@/components/typewriter-heading";
import { useScrubVideo } from "@/hooks/use-scrub-video";

const ACTION_PILLS = [
  "Pitch us an idea",
  "Come work here",
  "Send a brief hello",
  "See how we operate",
];
const EMAIL = "hello@mainframe.co";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [consoleOpen, setConsoleOpen] = useState(false);
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

      {/* Top nav — wordmark left, minimal text links right */}
      <nav className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex flex-col leading-tight">
          <span
            className="text-[20px] font-bold tracking-tight text-neutral-900 sm:text-[24px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Seet Min Yi
          </span>
          <span className="font-mono text-[9px] tracking-[0.16em] text-neutral-400 uppercase sm:text-[11px]">
            Business Analyst · Product Thinker
          </span>
        </div>
        <TopNav />
      </nav>

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
              onClick={() => setConsoleOpen(true)}
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

      {/* A.R.I.A chat console */}
      <AriaConsole open={consoleOpen} onClose={() => setConsoleOpen(false)} />
    </div>
  );
}
