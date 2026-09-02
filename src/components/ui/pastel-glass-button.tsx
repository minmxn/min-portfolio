import * as React from "react";

interface PastelGlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  /** Optional icon rendered after the label. */
  icon?: React.ReactNode;
}

/**
 * Glass button whose glow is a pair of counter-rotating pastel conic
 * gradients (from the PastelGradientBackground spec), viewed through the
 * same SVG glass-refraction filter as AuroraButton.
 */
export const PastelGlassButton = React.forwardRef<
  HTMLButtonElement,
  PastelGlassButtonProps
>(({ label = "Download for Mac", icon, className, ...props }, ref) => {
  return (
    <>
      <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
        <filter
          id="pastel-glass-distortion"
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
        className={`pastel-button ${className ?? ""}`}
        {...props}
      >
        {/* Two counter-rotating pastel conic gradients */}
        <span aria-hidden className="pastel-button__glow pastel-button__glow--a" />
        <span aria-hidden className="pastel-button__glow pastel-button__glow--b" />
        {/* Refraction layer */}
        <span aria-hidden className="aurora-button__distortion" />
        {/* Frosted glass surface + highlights */}
        <span aria-hidden className="aurora-button__surface" />
        {/* Label */}
        <span className="aurora-button__label inline-flex items-center gap-2">
          {label}
          {icon}
        </span>
      </button>
    </>
  );
});
PastelGlassButton.displayName = "PastelGlassButton";
