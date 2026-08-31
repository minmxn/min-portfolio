import { useEffect, useState } from "react";

interface TypewriterHeadingProps {
  text?: string;
  speed?: number;
  startDelay?: number;
  className?: string;
}

export function TypewriterHeading({
  text = "Glad you stopped in. Good taste tends to find us. Now, what are we building?",
  speed = 32,
  startDelay = 0,
  className = "max-w-2xl text-center text-2xl leading-snug font-medium text-neutral-900",
}: TypewriterHeadingProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    let iv: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      iv = setInterval(() => {
        setCount((c) => {
          if (c >= text.length) {
            clearInterval(iv);
            return c;
          }
          return c + 1;
        });
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(start);
      clearInterval(iv);
    };
  }, [text, speed, startDelay]);

  return (
    <h1 className={className} style={{ fontFamily: "var(--font-display)" }}>
      {text.slice(0, count)}
      <span
        aria-hidden
        className="animate-caret-blink ml-0.5 inline-block h-[1.1em] w-0.5 translate-y-[3px] bg-current"
      />
    </h1>
  );
}
