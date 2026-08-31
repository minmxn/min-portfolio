import { useEffect, type RefObject } from "react";

/**
 * Maps the cursor's horizontal position across the viewport onto the video
 * timeline, so the character animates as the pointer moves (ported from the
 * old static portfolio).
 */
export function useScrubVideo(videoRef: RefObject<HTMLVideoElement | null>) {
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
      const frac = Math.max(0, Math.min(1, clientX / window.innerWidth));
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
  }, [videoRef]);
}
