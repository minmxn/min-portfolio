import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Bot, Clapperboard, MonitorSmartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Feature = {
  id: string;
  label: string;
  icon: LucideIcon;
  image: string;
  description: string;
  href: string;
  status: string;
};

// Real portfolio projects (swap in more as you build them).
const FEATURES: Feature[] = [
  {
    id: "nomo",
    label: "Nomo News Bot",
    icon: Bot,
    image: "/work/nomo-news.png",
    description: "An AI news companion in Telegram, designed, built, and run in production.",
    href: "#nomo",
    status: "Live",
  },
  {
    id: "kling",
    label: "The Little Prince",
    icon: Clapperboard,
    image: "/work/kling-prince-front.webp",
    description: "A painterly clip made with Kling 3.0, testing character consistency.",
    href: "#kling",
    status: "Experiment",
  },
  {
    id: "portfolio",
    label: "This Portfolio",
    icon: MonitorSmartphone,
    image: "/work/portfolio-hero.webp",
    description: "A React 19 + Vite build with a mouse-scrubbed character and a glass A.R.I.A console.",
    href: "#home",
    status: "Live",
  },
];

const AUTO_PLAY_INTERVAL = 3500;
const ITEM_HEIGHT = 65;

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export function FeatureCarousel() {
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentIndex =
    ((step % FEATURES.length) + FEATURES.length) % FEATURES.length;

  const nextStep = useCallback(() => setStep((prev) => prev + 1), []);
  const prevStep = useCallback(() => setStep((prev) => prev - 1), []);

  // Jump to any index by the shortest direction (used by chips + dots).
  const goTo = (index: number) => {
    const len = FEATURES.length;
    let diff = index - currentIndex;
    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;
    setStep((s) => s + diff);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextStep, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextStep, isPaused]);

  const getCardStatus = (index: number) => {
    const diff = index - currentIndex;
    const len = FEATURES.length;
    let normalizedDiff = diff;
    if (diff > len / 2) normalizedDiff -= len;
    if (diff < -len / 2) normalizedDiff += len;
    if (normalizedDiff === 0) return "active";
    if (normalizedDiff === -1) return "prev";
    if (normalizedDiff === 1) return "next";
    return "hidden";
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="relative flex min-h-[520px] flex-col lg:aspect-video lg:min-h-0 lg:flex-row lg:items-center">
        {/* Left: chip rail (transparent, blends into the page) */}
        <div className="relative z-30 flex min-h-[300px] w-full flex-col items-start justify-center overflow-hidden px-4 md:px-8 lg:h-full lg:w-[40%] lg:pl-2">
          <div className="absolute inset-x-0 top-0 z-40 h-14 bg-gradient-to-b from-white via-white/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 z-40 h-14 bg-gradient-to-t from-white via-white/70 to-transparent" />
          <div className="relative z-20 flex h-full w-full items-center justify-center lg:justify-start">
            {FEATURES.map((feature, index) => {
              const isActive = index === currentIndex;
              const Icon = feature.icon;
              const distance = index - currentIndex;
              const wrappedDistance = wrap(
                -(FEATURES.length / 2),
                FEATURES.length / 2,
                distance,
              );
              return (
                <motion.div
                  key={feature.id}
                  style={{ height: ITEM_HEIGHT, width: "fit-content" }}
                  animate={{
                    y: wrappedDistance * ITEM_HEIGHT,
                    opacity: 1 - Math.abs(wrappedDistance) * 0.35,
                  }}
                  transition={{ type: "spring", stiffness: 90, damping: 22, mass: 1 }}
                  className="absolute flex items-center justify-start"
                >
                  <button
                    onClick={() => goTo(index)}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-full border px-6 py-3.5 text-left backdrop-blur-sm transition-all duration-500 md:px-8 md:py-4",
                      isActive
                        ? "z-10 border-neutral-900 bg-neutral-900 text-white shadow-[0_14px_34px_-12px_rgba(0,0,0,0.55)]"
                        : "border-black/15 bg-white/50 text-neutral-500 hover:border-black/30 hover:text-neutral-900",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] transition-colors duration-500",
                        isActive ? "text-emerald-400" : "text-neutral-400",
                      )}
                      strokeWidth={2}
                    />
                    <span className="font-mono text-[13px] tracking-[0.1em] whitespace-nowrap uppercase">
                      {feature.label}
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: stacked image cards (float on the page background) */}
        <div className="relative flex min-h-[420px] flex-1 flex-col items-center justify-center gap-6 px-6 py-10 lg:h-full lg:px-10">
          <div className="relative flex aspect-[4/5] w-full max-w-[380px] items-center justify-center">
            {FEATURES.map((feature, index) => {
              const status = getCardStatus(index);
              const isActive = status === "active";
              const isPrev = status === "prev";
              const isNext = status === "next";
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.id}
                  initial={false}
                  animate={{
                    x: isActive ? 0 : isPrev ? -100 : isNext ? 100 : 0,
                    scale: isActive ? 1 : isPrev || isNext ? 0.85 : 0.7,
                    opacity: isActive ? 1 : isPrev || isNext ? 0.4 : 0,
                    rotate: isPrev ? -3 : isNext ? 3 : 0,
                    zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 25, mass: 0.8 }}
                  drag={isActive ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.5}
                  onDragStart={() => setIsPaused(true)}
                  onDragEnd={(_, info) => {
                    setIsPaused(false);
                    if (info.offset.x < -80 || info.velocity.x < -400) nextStep();
                    else if (info.offset.x > 80 || info.velocity.x > 400) prevStep();
                  }}
                  className={cn(
                    "absolute inset-0 origin-center overflow-hidden rounded-[2rem] border-[6px] border-white bg-white shadow-[0_30px_70px_-25px_rgba(0,0,0,0.4)]",
                    isActive && "cursor-grab active:cursor-grabbing",
                  )}
                >
                  <img
                    src={feature.image}
                    alt={feature.label}
                    draggable={false}
                    className={cn(
                      "h-full w-full object-cover transition-all duration-700",
                      isActive ? "grayscale-0 blur-0" : "blur-[2px] grayscale brightness-75",
                    )}
                  />

                  <AnimatePresence>
                    {isActive && (
                      <motion.a
                        href={feature.href}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 pt-32"
                      >
                        <div className="mb-3 w-fit rounded-full border border-white/40 bg-white/90 px-3 py-1 font-mono text-[10px] tracking-[0.2em] text-neutral-900 uppercase">
                          {index + 1} · {feature.label}
                        </div>
                        <p className="text-[17px] leading-tight font-medium tracking-tight text-white drop-shadow-md md:text-[19px]">
                          {feature.description}
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1 font-mono text-[11px] tracking-[0.16em] text-emerald-300 uppercase">
                          View project
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </motion.a>
                    )}
                  </AnimatePresence>

                  <div
                    className={cn(
                      "absolute top-6 left-6 flex items-center gap-2 transition-opacity duration-300",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                    <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.3em] text-white/80 uppercase">
                      <Icon className="h-3 w-3" strokeWidth={2} />
                      {feature.status}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {FEATURES.map((feature, index) => (
              <button
                key={feature.id}
                onClick={() => goTo(index)}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                aria-label={`Go to ${feature.label}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "w-6 bg-emerald-500"
                    : "w-2 bg-neutral-300 hover:bg-neutral-400",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeatureCarousel;
