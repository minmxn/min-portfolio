import { useState } from "react";

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

/**
 * Minimal text navigation — uppercase, letter-spaced links that sit inline
 * with the wordmark (rendered inside the hero's top nav bar).
 */
export function TopNav() {
  const [active, setActive] = useState("home");

  return (
    <div className="hidden items-center gap-7 sm:flex sm:gap-9">
      {NAV_ITEMS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            aria-current={isActive ? "page" : undefined}
            className={`font-mono text-[15px] font-medium tracking-[0.18em] uppercase transition-colors ${
              isActive
                ? "text-neutral-900"
                : "text-neutral-400 hover:text-neutral-900"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
