import { useEffect, type RefObject } from "react";

/**
 * Maps the cursor's horizontal position across the viewport onto the video
 * timeline, so the character animates as the pointer moves (ported from the
 * old static portfolio).
 *
 * `originRef` (optional) anchors the video's first frame (0s) to an element's
 * left edge instead of the viewport's left edge: the cursor sitting on that
 * element shows frame 0, and the animation plays out as the cursor moves right
 * toward the viewport edge. Anything left of the origin holds on frame 0.
 */
export function useScrubVideo<T extends HTMLElement = HTMLElement>(
  videoRef: RefObject<HTMLVideoElement | null>,
  originRef?: RefObject<T | null>,
) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let targetTime: number | null = null;
    let seeking = false;

    const onLoaded = () => {
      try {
        video.pause();
        video.currentTime = 0;
      } catch {
        /* ignore */
      }
    };

    const onSeeked = () => {
      if (targetTime != null && Math.abs(video.currentTime - targetTime) > 0.02) {
        try {
          video.currentTime = targetTime;
        } catch {
          /* ignore */
        }
      } else {
        seeking = false;
      }
    };

    const scrubTo = (clientX: number) => {
      if (!video.duration || Number.isNaN(video.duration)) return;
      // Scrub origin (frame 0): the origin element's left edge if provided,
      // otherwise the viewport's left edge.
      const originX = originRef?.current
        ? originRef.current.getBoundingClientRect().left
        : 0;
      const span = window.innerWidth - originX;
      const frac =
        span > 0 ? Math.max(0, Math.min(1, (clientX - originX) / span)) : 0;
      targetTime = frac * video.duration;
      if (!seeking) {
        seeking = true;
        try {
          video.currentTime = targetTime;
        } catch {
          /* ignore */
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => scrubTo(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length) scrubTo(e.touches[0].clientX);
    };

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("seeked", onSeeked);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("seeked", onSeeked);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [videoRef, originRef]);
}
