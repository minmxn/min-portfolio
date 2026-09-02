import * as React from "react";

interface AuroraButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

/**
 * Liquid-glass button. The "genuine glass refraction" comes from an SVG
 * displacement filter (feTurbulence -> feDisplacementMap) applied via
 * backdrop-filter, which physically warps whatever is behind the button —
 * not just a flat blur. Chrome/Edge/Brave render the refraction; Safari/
 * Firefox gracefully fall back to the plain frosted blur.
 */
export const AuroraButton = React.forwardRef<
  HTMLButtonElement,
  AuroraButtonProps
>(({ label = "Download for Mac", className, ...props }, ref) => {
  return (
    <>
      {/* Off-screen SVG holding the refraction filter. */}
      <svg
        aria-hidden
        width="0"
        height="0"
        style={{ position: "absolute" }}
      >
        <filter
          id="aurora-glass-distortion"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.004 0.006"
            numOctaves="2"
            seed="42"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="1.5" result="blurred" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurred"
            scale="120"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <button
        ref={ref}
        className={`aurora-button ${className ?? ""}`}
        {...props}
      >
        {/* Colorful aurora glow that bleeds through the glass */}
        <span aria-hidden className="aurora-button__glow" />
        {/* Refractive distortion layer (warps the background) */}
        <span aria-hidden className="aurora-button__distortion" />
        {/* Frosted glass surface + edge highlights */}
        <span aria-hidden className="aurora-button__surface" />
        {/* Label */}
        <span className="aurora-button__label">{label}</span>
      </button>
    </>
  );
});
AuroraButton.displayName = "AuroraButton";
