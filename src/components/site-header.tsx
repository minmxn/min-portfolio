import { useEffect, useState } from "react";
import { NAV_ITEMS, TopNav, useActiveHash } from "@/components/top-nav";

/**
 * Fixed top bar shared across views: identity block (left) + text nav (right,
 * desktop) with a hamburger + overlay menu on mobile.
 */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const hash = useActiveHash();

  // Close the menu whenever the route (hash) changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [hash]);

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-30 flex items-center justify-between bg-gradient-to-b from-white via-white/85 to-transparent px-5 pt-4 pb-6 sm:px-8">
        <a href="#home" className="flex flex-col leading-tight">
          <span
            className="text-[20px] font-bold tracking-tight text-neutral-900 sm:text-[24px]"
            style={{ fontFamily: '"Chakra Petch", sans-serif' }}
          >
            Seet Min Yi
          </span>
          <span className="font-mono text-[9px] tracking-[0.16em] text-neutral-400 uppercase sm:text-[11px]">
            Business Analyst · Product Thinker
          </span>
        </a>

        <TopNav />

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          className="flex flex-col gap-[5px] p-2 sm:hidden"
        >
          <span
            className={`h-0.5 w-6 bg-neutral-900 transition-all ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-neutral-900 transition-all ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-neutral-900 transition-all ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile overlay menu */}
      <div
        className={`fixed inset-0 z-20 flex flex-col items-start justify-center gap-6 bg-white/95 px-8 backdrop-blur-md transition-opacity sm:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {NAV_ITEMS.map(({ id, label, href }) => (
          <a
            key={id}
            href={href}
            aria-current={hash === href ? "page" : undefined}
            className={`font-mono text-[28px] font-medium tracking-[0.06em] uppercase transition-colors ${
              hash === href ? "text-neutral-900" : "text-neutral-400"
            }`}
          >
            {label}
          </a>
        ))}
      </div>
    </>
  );
}
