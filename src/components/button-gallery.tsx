import { AuroraButton } from "@/components/ui/aurora-button";
import { PastelGlassButton } from "@/components/ui/pastel-glass-button";
import { MetalAuroraButton } from "@/components/ui/metal-aurora-button";
import { MetalPastelButton } from "@/components/ui/metal-pastel-button";
import { MetalAnimatedButton } from "@/components/ui/metal-animated-button";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

/**
 * Reference gallery of all the button explorations. Open it anytime at
 * /#buttons (see App.tsx). Not part of the live site.
 */
export function ButtonGallery() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-16 bg-neutral-100 py-24"
      style={{
        backgroundImage:
          "radial-gradient(rgba(0,0,0,0.14) 1.2px, transparent 1.2px)",
        backgroundSize: "22px 22px",
      }}
    >
      <a
        href="#"
        className="fixed top-4 left-4 z-30 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 font-mono text-[10px] tracking-widest text-black/50 uppercase backdrop-blur-sm transition-colors hover:text-black"
      >
        ← Back to site
      </a>

      <div className="flex flex-col items-center gap-3">
        <span className="text-xs font-medium tracking-widest text-neutral-400 uppercase">
          Aurora glass
        </span>
        <AuroraButton />
      </div>

      <div className="flex flex-col items-center gap-3">
        <span className="text-xs font-medium tracking-widest text-neutral-400 uppercase">
          Pastel glass
        </span>
        <PastelGlassButton />
      </div>

      <div className="flex flex-col items-center gap-3">
        <span className="text-xs font-medium tracking-widest text-neutral-400 uppercase">
          Aurora glass + metal rim
        </span>
        <MetalAuroraButton />
      </div>

      <div className="flex flex-col items-center gap-3">
        <span className="text-xs font-medium tracking-widest text-neutral-400 uppercase">
          Pastel glass + metal rim
        </span>
        <MetalPastelButton />
      </div>

      <div className="flex flex-col items-center gap-3">
        <span className="text-xs font-medium tracking-widest text-neutral-400 uppercase">
          Animated metal rim + grey text
        </span>
        <MetalAnimatedButton />
      </div>

      <div className="flex flex-col items-center gap-3">
        <span className="text-xs font-medium tracking-widest text-neutral-400 uppercase">
          Liquid metal
        </span>
        <div className="flex items-center gap-6">
          <LiquidMetalButton label="Download for Mac" theme="light" />
          <LiquidMetalButton label="Download for Mac" theme="dark" />
        </div>
      </div>
    </div>
  );
}
