import * as React from "react";

interface MetalAnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

/**
 * Aurora glass button wrapped in an animated brushed-metal rim (the
 * metallic highlight rotates around the edge) with a solid grey label.
 */
export const MetalAnimatedButton = React.forwardRef<
  HTMLButtonElement,
  MetalAnimatedButtonProps
>(({ label = "Download for Mac", className, ...props }, ref) => {
  return (
    <>
      <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
        <filter
          id="metal-animated-distortion"
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

      <div className="metal-frame metal-frame--animated">
        <button ref={ref} className={`aurora-button ${className ?? ""}`} {...props}>
          <span aria-hidden className="aurora-button__glow" />
          <span aria-hidden className="aurora-button__distortion" />
          <span aria-hidden className="aurora-button__surface" />
          <span className="aurora-button__label aurora-button__label--grey">
            {label}
          </span>
        </button>
      </div>
    </>
  );
});
MetalAnimatedButton.displayName = "MetalAnimatedButton";
