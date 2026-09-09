import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { AmbientBackground } from "@/components/ambient-background";
import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";

const META = [
  { label: "Role", value: "Direction, prompt writing, edit" },
  { label: "Tool", value: "Kling 3.0" },
  { label: "Duration", value: "~5 second clip" },
];

const REFERENCES = [
  {
    src: "/work/kling-prince-front.webp",
    caption: "Prince, front. The seed every other shot references.",
  },
  {
    src: "/work/kling-prince-side.webp",
    caption: "Prince, side. Checks the silhouette against the seed.",
  },
  {
    src: "/work/kling-fox-front.webp",
    caption: "Fox, front. The Prince's companion in the story.",
  },
];

const LEARNINGS = [
  {
    label: "What surprised me",
    body: "The quality-to-effort ratio. With one character reference sheet and a handful of prompts, Kling kept the Prince visually consistent across angles and distances, the technically hard part of generative video. The motion felt intentional, not like a glitchy demo.",
  },
  {
    label: "Where it broke down",
    body: "The free tier caps you at around 66 credits a day, roughly one reference and one 5-second clip per session, so iteration is slow and you commit to a direction early. Consistency also drifted in motion-heavy shots, with fine details like clothing texture shifting between cuts.",
  },
  {
    label: "Why it was worth it",
    body: "Working with it hands-on gave me a feel for where generative AI actually sits today, not just what the marketing says. That firsthand read matters when you are deciding whether a tool belongs in something you are building.",
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 font-mono text-[11px] tracking-[0.24em] text-emerald-600 uppercase">
      {children}
    </div>
  );
}

export function KlingCaseStudy() {
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
        <SectionLabel>Case Study · Generative AI</SectionLabel>
        <h1
          className="text-[clamp(30px,6vw,52px)] leading-[1.05] font-bold tracking-tight"
          style={{ fontFamily: '"Chakra Petch", sans-serif' }}
        >
          The Little Prince
        </h1>
        <p className="mt-3 max-w-xl text-[clamp(16px,2.5vw,20px)] text-neutral-500">
          A painterly clip made with Kling 3.0, treating character consistency
          as a product-thinking exercise, not just a demo.
        </p>

        {/* Meta */}
        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-y border-black/10 py-5">
          {META.map((m) => (
            <div key={m.label}>
              <div className="font-mono text-[10px] tracking-[0.2em] text-black/40 uppercase">
                {m.label}
              </div>
              <div className="mt-1 text-[15px] font-medium">{m.value}</div>
            </div>
          ))}
        </div>

        {/* Video — portrait clip, shown at phone size and centered */}
        <div className="mx-auto mt-10 w-full max-w-[300px] overflow-hidden rounded-2xl border border-black/10 bg-neutral-950 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)]">
          <video
            src="/work/the-little-prince.mp4"
            poster="/work/kling-prince-front.webp"
            controls
            playsInline
            className="w-full"
          />
        </div>
        <p className="mt-3 text-center font-mono text-[10px] tracking-[0.18em] text-neutral-400 uppercase">
          Sound on for the ambience
        </p>

        {/* Intent */}
        <Reveal><section className="mt-16 max-w-2xl">
          <SectionLabel>The intent</SectionLabel>
          <p className="text-[17px] leading-relaxed text-neutral-600">
            I picked The Little Prince because it is a beloved painterly world,
            and because it is a real test of what generative video can and
            cannot do yet. Keeping one character consistent across multiple
            shots is the hard part. Framing it as a challenge up front turns the
            experiment into a product-thinking exercise, not just a demo.
          </p>
        </section></Reveal>

        {/* Reference sheet */}
        <Reveal><section className="mt-16">
          <SectionLabel>The reference sheet</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-3">
            {REFERENCES.map((ref) => (
              <figure key={ref.src}>
                <div className="overflow-hidden rounded-xl border border-black/10 bg-neutral-100">
                  <img
                    src={ref.src}
                    alt={ref.caption}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                </div>
                <figcaption className="mt-2 text-[13px] leading-snug text-neutral-500">
                  {ref.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section></Reveal>

        {/* Prompt pattern */}
        <Reveal><section className="mt-16 max-w-2xl">
          <SectionLabel>The prompt pattern</SectionLabel>
          <p className="text-[17px] leading-relaxed text-neutral-600">
            A fixed style prompt plus varying scene prompts. The style prompt
            keeps every shot on the same visual grammar, so cuts between scenes
            feel like the same film. The scene prompts change the beat, the
            camera, the lighting, and the audio bed.
          </p>
          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-black/10 bg-neutral-50 p-4">
              <div className="mb-1.5 font-mono text-[10px] tracking-[0.2em] text-emerald-600 uppercase">
                Style prompt (pinned)
              </div>
              <p className="font-mono text-[13px] leading-relaxed text-neutral-600">
                Cinematic painterly storybook watercolor and soft 3D, shallow
                depth of field, gentle film grain, muted warm golds and deep
                starry blues.
              </p>
            </div>
            <div className="rounded-xl border border-black/10 bg-neutral-50 p-4">
              <div className="mb-1.5 font-mono text-[10px] tracking-[0.2em] text-black/40 uppercase">
                Scene prompt (varies)
              </div>
              <p className="font-mono text-[13px] leading-relaxed text-neutral-600">
                Prince stands on a tiny asteroid in star-filled space, golden
                scarf drifting weightlessly, looking up in quiet wonder. Slow
                orbital drift, gentle push-in. Cool starlight rim-light. Ambient:
                soft cosmic hum, faint chimes, tender piano.
              </p>
            </div>
          </div>
        </section></Reveal>

        {/* Learnings */}
        <Reveal><section className="mt-16">
          <SectionLabel>What I learned</SectionLabel>
          <div className="grid gap-6 sm:grid-cols-3">
            {LEARNINGS.map((l) => (
              <div key={l.label}>
                <h3
                  className="text-[17px] font-semibold tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {l.label}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">
                  {l.body}
                </p>
              </div>
            ))}
          </div>
        </section></Reveal>

        {/* Next project */}
        <Reveal><a
          href="#nomo"
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
              Nomo News Bot
            </div>
            <div className="mt-0.5 text-[14px] text-neutral-500">
              An AI news companion, built and run in production every day.
            </div>
          </div>
          <ArrowUpRight className="h-6 w-6 shrink-0 text-neutral-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-600" />
        </a></Reveal>

        {/* Footer credit + back */}
        <div className="mt-10 flex items-center justify-between border-t border-black/10 pt-6">
          <span className="font-mono text-[10px] tracking-[0.18em] text-neutral-400 uppercase">
            Made with Kling 3.0 · 2026
          </span>
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
