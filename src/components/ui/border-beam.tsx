import { cn } from "@/lib/utils";

interface BorderBeamProps {
  /** Corner radius of the border, in px. Match the parent's radius. */
  radius?: number;
  /** Thickness of the crisp border line, in px. */
  thickness?: number;
  /** Soft halo spread around the line, in px (0 = none). */
  glow?: number;
  /** Length of the bright comet, in degrees of the conic sweep. */
  cometLength?: number;
  /** Inset from the parent edge, in px. Negative pushes the beam onto the edge. */
  position?: number;
  /** Seconds for one full lap. */
  duration?: number;
  className?: string;
}

/** Pastel-rainbow comet colours, tail → head. */
const COLORS = ["#ff8fb0", "#ffc978", "#7fe0b8", "#b9a3ff"];

/**
 * A pastel "border beam" — a light that sweeps around the rounded border of
 * its positioned parent. The parent must be `position: relative`; this fills it
 * as an absolute, pointer-transparent overlay.
 *
 * Two stacked masked rings share one rotating conic gradient (a bright pastel
 * comet against transparent): a blurred, thicker ring underneath paints the
 * halo, a crisp ring on top paints the line. Masking keeps the light in the
 * border ring, so it traces the frame and rounds the corners instead of
 * spilling into the body. `position` nudges the whole thing in/out.
 *
 * Speed is driven by the `--beam-duration` CSS variable so callers can ramp it
 * (e.g. faster while an agent is thinking). Honors `prefers-reduced-motion`.
 */
export function BorderBeam({
  radius = 24,
  thickness = 2,
  glow = 8,
  cometLength = 100,
  position = 0,
  duration = 8,
  className,
}: BorderBeamProps) {
  const start = 360 - cometLength;
  const [c0, c1, c2, c3] = COLORS;
  const sweep = `conic-gradient(from 0deg, transparent 0deg, transparent ${start}deg, ${c0} ${
    start + cometLength * 0.4
  }deg, ${c1} ${start + cometLength * 0.65}deg, ${c2} ${
    start + cometLength * 0.85
  }deg, ${c3} 359deg, transparent 360deg)`;

  const ringMask: React.CSSProperties = {
    WebkitMask:
      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
  } as React.CSSProperties;

  return (
    <div
      aria-hidden
      className={cn("border-beam pointer-events-none absolute", className)}
      style={
        {
          inset: position,
          borderRadius: radius,
          "--beam-duration": `${duration}s`,
        } as React.CSSProperties
      }
    >
      {glow > 0 && (
        <div
          className="border-beam__ring absolute inset-0"
          style={{
            borderRadius: radius,
            padding: thickness + glow,
            filter: `blur(${glow * 0.6}px)`,
            opacity: 0.85,
            ...ringMask,
          }}
        >
          <div
            className="border-beam__sweep absolute"
            style={{ inset: "-50%", background: sweep }}
          />
        </div>
      )}
      <div
        className="border-beam__ring absolute inset-0"
        style={{ borderRadius: radius, padding: thickness, ...ringMask }}
      >
        <div
          className="border-beam__sweep absolute"
          style={{ inset: "-50%", background: sweep }}
        />
      </div>
    </div>
  );
}

export default BorderBeam;
