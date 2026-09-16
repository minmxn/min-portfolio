// Seed Lab posts + the shared Post type. These 3 posts live in code (no KV
// migration); api/posts.ts and lab.tsx merge them with KV-published posts.
export type Post = {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  tags: string[];
  excerpt: string;
  body: string[];
  // Cover art. `accent` is a [from, to] gradient used to generate on-brand
  // cover art; set `cover` to a real image URL to override it. `kicker` is the
  // short overlay label on the cover.
  accent: [string, string];
  kicker: string;
  cover?: string;
  // Real, relevant links shown as "Further reading" on the detail page.
  links: { label: string; href: string }[];
};

export const POSTS: Post[] = [
  {
    slug: "skills-not-prompts",
    title: "I stopped writing clever prompts. My output got better.",
    date: "Sep 2026",
    readTime: "4 min",
    tags: ["Agents", "Workflow"],
    excerpt:
      "For months I collected prompts like they were spells. Then I realised the ones that actually held up weren't clever at all — they were just me writing down what I already did.",
    body: [
      "I used to keep a little text file of prompts I was proud of. Really specific wording, a few examples, the occasional 'this is very important to my career' because someone on the internet swore it worked. And honestly? Half the time it did — once. The next morning the same prompt gave me something worse and I couldn't tell you why.",
      "What finally clicked wasn't a better prompt. It was boring. I sat down and typed out the thing I already do in my head every time I pick up a task — how I scope it, what I check before I call it done, the two mistakes I always make so watch for them. Then I handed that over as a reusable skill instead of retyping it.",
      "The difference showed up on my worst days. On a Friday afternoon when I'm tired and sloppy, I used to write lazy prompts and get lazy output. Now the process doesn't depend on my mood — it's written down, so the agent follows it whether I'm sharp or half-asleep. That consistency is the whole thing.",
      "My rule of thumb now is dumb but it works: if I catch myself explaining the same thing to an agent twice, I stop and make it a skill. I've been wrong about a lot of AI stuff. This is the one habit I'd defend.",
    ],
    accent: ["#a7f3d0", "#059669"],
    kicker: "Agent skills",
    links: [
      { label: "Anthropic — Agent Skills", href: "https://www.anthropic.com/news" },
      { label: "Claude Code docs", href: "https://docs.claude.com/en/docs/claude-code" },
    ],
  },
  {
    slug: "copilot-vs-agent",
    title: "Copilot and a terminal agent are not competing for the same job.",
    date: "Aug 2026",
    readTime: "6 min",
    tags: ["GitHub", "Tooling"],
    excerpt:
      "People keep asking me which one to 'switch to', like it's a phone plan. I use both, most days, and I almost never think about it — because they're not actually doing the same job.",
    body: [
      "I get this question a lot, usually framed as a versus. Copilot or the agent. Pick a side. But when I actually watch how I work, I reach for them at completely different moments, and it's never a hard decision.",
      "Copilot is for when I already know what I'm typing. I'm in the middle of a function, I can see the next ten lines in my head, and it just… types them for me while I keep thinking. It's a keyboard thing. I barely register it. If it guesses wrong I hit escape and move on — no harm done.",
      "The terminal agent comes out for the stuff I don't want to hold in my head. Last week I had a test that only failed in CI, never locally. Old me would've spent an afternoon adding print statements. Instead I described the problem, let the agent dig through the files, and reviewed what it found. I wasn't reviewing keystrokes — I was reviewing a conclusion.",
      "The only time I've been burned is when I used the wrong one for the size of the job — babysitting an agent through a one-line change, or expecting autocomplete to refactor across ten files. So that's my whole mental model now: how big is the thing in my head? Small and known, Copilot. Big and fuzzy, agent. That's it.",
    ],
    accent: ["#bfdbfe", "#4f46e5"],
    kicker: "GitHub · Tooling",
    links: [
      { label: "GitHub Copilot", href: "https://github.com/features/copilot" },
      { label: "Claude Code", href: "https://claude.com/claude-code" },
    ],
  },
  {
    slug: "read-the-plausible-code",
    title: "The danger isn't bad AI code. It's plausible code you didn't read.",
    date: "Jul 2026",
    readTime: "3 min",
    tags: ["Tips", "AI usage"],
    excerpt:
      "I shipped a bug once that the AI wrote and I approved without really reading. It compiled. It looked right. It was wrong in a way nothing warned me about. That day changed how I work.",
    body: [
      "Here's the thing nobody tells you: AI almost never writes code that's obviously broken. Broken code is easy — the editor lights up red, you fix it, you move on. What it writes is code that looks completely reasonable, compiles fine, and then quietly does the wrong thing on the one edge case you forgot to mention. There's no squiggle for that.",
      "I learned this the annoying way. A change I skimmed, nodded at, and merged, because it looked exactly like what I would've written. It wasn't. Since then I keep the loop deliberately tight: small diffs I can actually read top to bottom, real checks instead of 'looks good', and one rule I don't bend — if I couldn't explain it out loud to a teammate, it doesn't ship.",
      "The other half of the fix is upstream, before the model writes anything. 'Add auth' gets me vague mush. 'Add email and password login, lock the account after five failed tries, return a 429' gets me something I can actually review. I've started thinking of the model as a fast, very literal junior dev: brilliant, tireless, and completely happy to build the wrong thing confidently if I was sloppy with the brief.",
      "The tools got a lot faster this year. The bar for what I'll put my name on hasn't moved an inch, and I don't think it should.",
    ],
    accent: ["#fde68a", "#d97706"],
    kicker: "Tips · AI usage",
    links: [
      { label: "GitHub Docs — Copilot", href: "https://docs.github.com/en/copilot" },
      { label: "Simon Willison on LLMs", href: "https://simonwillison.net" },
    ],
  },
];
