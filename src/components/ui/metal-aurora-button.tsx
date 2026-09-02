import * as React from "react";

interface MetalAuroraButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

/** Aurora glass button wrapped in a brushed-metal rim. */
export const MetalAuroraButton = React.forwardRef<
  HTMLButtonElement,
  MetalAuroraButtonProps
>(({ label = "Download for Mac", className, ...props }, ref) => {
  return (
    <>
      <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
        <filter
          id="metal-aurora-distortion"
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

      <div className="metal-frame">
        <button ref={ref} className={`aurora-button ${className ?? ""}`} {...props}>
          <span aria-hidden className="aurora-button__glow" />
          <span aria-hidden className="aurora-button__distortion" />
          <span aria-hidden className="aurora-button__surface" />
          <span className="aurora-button__label">{label}</span>
        </button>
      </div>
    </>
  );
});
MetalAuroraButton.displayName = "MetalAuroraButton";
