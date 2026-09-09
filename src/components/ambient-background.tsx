// Shared page background: soft pastel glows (+ optional dot grid). Rendered at
// z-0 behind content; pages put their content at `relative z-[1]`.
export const PASTEL =
  "conic-gradient(from 0deg, #ffd1dc, #ffe0b3, #fff5ba, #c8f7d4, #b3e5ff, #d7c9ff, #ffd1dc)";

export function AmbientBackground({
  dots = true,
  glows = true,
}: {
  dots?: boolean;
  /** Pastel glow blobs. Set false for a plain white background. */
  glows?: boolean;
}) {
  return (
    <>
      {dots && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(0,0,0,0.10) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
      )}
      {glows && (
        <>
          <div
            aria-hidden
            className="pointer-events-none fixed -top-40 -right-32 z-0 h-[32rem] w-[32rem] rounded-full opacity-40 blur-[90px]"
            style={{ background: PASTEL }}
          />
          <div
            aria-hidden
            className="pointer-events-none fixed -bottom-48 -left-40 z-0 h-[30rem] w-[30rem] rounded-full opacity-30 blur-[100px]"
            style={{ background: PASTEL }}
          />
        </>
      )}
    </>
  );
}
