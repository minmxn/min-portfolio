// Single source of truth for Min Yi's portfolio facts.
//
// Both the React site (About, Work, …) and A.R.I.A (api/aria.ts) read from
// here, so the agent can never drift out of sync with what the site says.
// Update facts HERE — not in the components or the agent prompt.

export const OWNER = {
  name: "Seet Min Yi",
  tagline: "Business Analyst · Product Thinker",
  pronouns: "she/her",
  email: "seetminyi.work@gmail.com",
  company: "Accenture",
  // Public GitHub handle. The nightly cron (api/refresh-github.ts) fetches this
  // user's public repos so A.R.I.A can mention recent project activity.
  // Leave "" to disable the GitHub feature entirely.
  githubUser: "minmxn",
} as const;

export interface Role {
  /** Human-readable period, e.g. "Jun 2026 - Now". Use "Now" for the current role. */
  period: string;
  title: string;
  org: string;
  current?: boolean;
}

// Career trajectory, newest first. Mirrored on the About page timeline.
export const ROLES: Role[] = [
  { period: "Jun 2026 - Now", title: "Senior Business Architecture Analyst", org: "Accenture", current: true },
  { period: "Sep 2024 - May 2026", title: "Business Architecture Analyst", org: "Accenture" },
  { period: "Aug 2023 - Sep 2024", title: "Functional Analyst", org: "Accenture · Internship" },
  { period: "Apr 2019 - Sep 2019", title: "Software Engineer", org: "Accenture · Internship" },
];

// By-the-numbers cards. Confirm these figures before publishing.
export const STATS = [
  { value: "5+", label: "Years in delivery" },
  { value: "$5M+", label: "Portfolio delivered" },
  { value: "Live", label: "Products in production" },
] as const;

export const SKILLS = [
  "Business Analysis",
  "Requirements",
  "UAT",
  "Stakeholder Mgmt",
  "Agile Delivery",
  "Node.js",
  "LLM Integration",
  "APIs",
  "Prompt Engineering",
  "Oracle Cloud",
] as const;

export interface Project {
  /** Anchor id used in site nav (e.g. "nomo" → #nomo). */
  id: string;
  name: string;
  tagline: string;
  /** Bullet facts A.R.I.A can cite. Keep them true and specific. */
  facts: string[];
}

export const PROJECTS: Project[] = [
  {
    id: "nomo",
    name: "Nomo News Bot",
    tagline: "Flagship — an AI news companion on Telegram, live in production daily.",
    facts: [
      "On Telegram as @nomogh_bot. Role: product, engineering & ops, solo. Costs $0 to run on free-tier infra.",
      "Stack: Node.js, Telegram Bot API, Groq LLM, NewsAPI, Tavily, Oracle Cloud, PM2.",
      "8am morning briefing, 9am daily poll, 10am quiz, swipeable news readers at noon/3pm/6pm/8pm (Singapore time); answers free-text questions with live web search.",
      "Notable engineering: combined three NewsAPI queries into one + caching to stay under a 100-call/day quota; retry-on-rate-limit wrapper; silent AI fallbacks so it never posts a blank screen; migrated hosting to Oracle Cloud free tier to hit $0.",
      "Origin: built for Min Yi's friend group (\"Market Kakis\") to follow markets/world/tech news without doom-scrolling.",
    ],
  },
  {
    id: "kling",
    name: "The Little Prince",
    tagline: "Generative video case study — a ~5-second painterly clip made with Kling 3.0.",
    facts: [
      "Role: direction, prompt writing, edit. Framed as a product-thinking exercise: keeping one character visually consistent across shots is the hard part of generative video.",
      "Technique: a pinned style prompt (cinematic painterly storybook watercolor + soft 3D) plus varying scene prompts. Free tier caps ~66 credits/day, forcing early commitment.",
      "Takeaway: a hands-on read of where generative AI actually sits today, which matters when deciding whether a tool belongs in a real product.",
    ],
  },
];

// Site sections A.R.I.A can point visitors to.
export const NAV = [
  { label: "Work", anchor: "#work" },
  { label: "Nomo case study", anchor: "#nomo" },
  { label: "Kling / Little Prince", anchor: "#kling" },
  { label: "About", anchor: "#about" },
  { label: "Contact", anchor: "#contact" },
] as const;
