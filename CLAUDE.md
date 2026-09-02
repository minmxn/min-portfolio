# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then produce a production build in `dist/`
- `npm run lint` — run Oxlint (config in `.oxlintrc.json`)
- `npm run preview` — serve the production build locally

There is no test runner configured in this project.

## Architecture

Single-page React 19 + TypeScript portfolio built with Vite 8 and Tailwind CSS v4. The app currently renders one screen: `App.tsx` returns only `<Hero />`.

- **Entry flow:** `src/main.tsx` → `src/App.tsx` → `src/components/hero.tsx`. `hero.tsx` is the whole page — nav, mobile menu, the mouse-scrubbed character video, typewriter copy, CTA, and action pills. Hero content (nav links, action pills, email) lives in module-level constants at the top of `hero.tsx`.
- **Path alias:** `@/` maps to `src/` (declared in both `tsconfig.json` and `vite.config.ts` — keep them in sync).
- **Video scrubbing:** `src/hooks/use-scrub-video.ts` maps the cursor's horizontal viewport position onto the `<video>` timeline (no autoplay — frames advance with pointer/touch movement). The video source is `/girl_animation.mp4`, served from `public/`, not imported.
- **Typewriter:** `src/components/typewriter-heading.tsx` animates text reveal via an interval and keeps a CSS blinking caret (`animate-caret-blink`, defined in `index.css`) running after typing finishes.

## Styling conventions

- Tailwind v4 is configured via `@tailwindcss/vite` and imported in `src/index.css` (no `tailwind.config.js`). Theme tokens, the light/dark CSS variables, and custom component styles all live in `index.css`.
- The glass button (`src/components/ui/glass-button.tsx`) is a structural React component whose actual glassmorphism (`.glass-button*` classes) is defined in the `@layer components` block of `index.css`. Editing its look means editing the CSS there, not just the Tailwind classes.
- Note there are two `cn` helpers: the shared `src/lib/utils.ts` (`clsx` + `tailwind-merge`) and a lightweight local one inside `glass-button.tsx`. Prefer the shared one for new components.
- Fonts use the `--font-display` CSS variable (Space Grotesk) applied via inline `style`.

## Deployment

Deployed on Vercel as a Vite SPA (`vercel.json` pins framework + build settings and rewrites all routes to `/index.html`).
