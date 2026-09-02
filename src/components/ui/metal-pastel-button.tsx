import * as React from "react";

interface MetalPastelButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

/** Pastel (counter-rotating conic) glass button wrapped in a brushed-metal rim. */
export const MetalPastelButton = React.forwardRef<
  HTMLButtonElement,
  MetalPastelButtonProps
>(({ label = "Download for Mac", className, ...props }, ref) => {
  return (
    <div className="metal-frame">
      <button ref={ref} className={`pastel-button ${className ?? ""}`} {...props}>
        <span aria-hidden className="pastel-button__glow pastel-button__glow--a" />
        <span aria-hidden className="pastel-button__glow pastel-button__glow--b" />
        <span aria-hidden className="aurora-button__distortion" />
        <span aria-hidden className="aurora-button__surface" />
        <span className="aurora-button__label">{label}</span>
      </button>
    </div>
  );
});
MetalPastelButton.displayName = "MetalPastelButton";
