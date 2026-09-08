import { useEffect, useState } from "react";

export const NAV_ITEMS = [
  { id: "home", label: "Home", href: "#home" },
  { id: "work", label: "Work", href: "#work" },
  { id: "about", label: "About", href: "#about" },
  { id: "contact", label: "Contact", href: "#contact" },
];

/** Shared hook: current hash (defaults to #home), updates on hashchange. */
export function useActiveHash() {
  const [hash, setHash] = useState(() => window.location.hash || "#home");
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || "#home");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  return hash;
}

/**
 * Minimal text navigation — uppercase, letter-spaced links, top-right. Uses
 * hash routing (see App.tsx); the active item tracks the current hash.
 */
export function TopNav() {
  const hash = useActiveHash();

  return (
    <div className="hidden items-center gap-7 sm:flex sm:gap-9">
      {NAV_ITEMS.map(({ id, label, href }) => {
        const isActive = hash === href;
        return (
          <a
            key={id}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`font-mono text-[15px] font-medium tracking-[0.18em] uppercase transition-colors ${
              isActive
                ? "text-neutral-900"
                : "text-neutral-400 hover:text-neutral-900"
            }`}
          >
            {label}
          </a>
        );
      })}
    </div>
  );
}
