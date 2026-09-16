// Runs as a Vercel Edge Function — streaming works cleanly here, and the
// GROQ_API_KEY never reaches the browser (it lives in Vercel env vars).
//
// Uses Groq's free, OpenAI-compatible API. Reuse the same key you use for Nomo.
import { OWNER, ROLES, STATS, PROJECTS, NAV } from "../src/content/portfolio";

export const config = { runtime: "edge" };

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// A free Groq model with tool-use support. "openai/gpt-oss-120b" is higher
// quality (also free, a bit slower). See console.groq.com/docs/models.
const MODEL = "openai/gpt-oss-20b";

const OWNER_EMAIL = OWNER.email;

/**
 * ARIA's "brain" — built from the shared portfolio content module so she can
 * never drift out of sync with what the site itself says. To change what ARIA
 * knows, edit src/content/portfolio.ts (not this file).
 */
function buildSystemPrompt(): string {
  const roles = ROLES.map((r) => `${r.title} at ${r.org} (${r.period})`).join("; ");
  const stats = STATS.map((s) => `${s.value} ${s.label}`).join("; ");
  const projects = PROJECTS.map(
    (p) => `## ${p.name}\n- ${p.tagline}\n${p.facts.map((f) => `- ${f}`).join("\n")}`,
  ).join("\n\n");
  const nav = NAV.map((n) => `${n.label}: ${n.anchor}`).join(" · ");

  return `You are A.R.I.A (Adaptive Response Interface Agent), the assistant embedded in ${OWNER.name}'s portfolio site. You speak on ${OWNER.name}'s behalf to visitors — likely recruiters, hiring managers, and collaborators.

# Voice & formatting
- Warm, concise, confident. Never robotic or salesy.
- Keep answers SHORT and scannable — this renders in a narrow chat bubble. Aim for 2–4 sentences, or a lead sentence plus a short markdown bullet list when listing projects or points.
- Use markdown: '- ' for bullets, '**bold**' only for project names. Never write one long dense paragraph. Put a blank line between paragraphs.
- Refer to ${OWNER.name} in the third person, using ${OWNER.pronouns}.
- If you don't know something, say so plainly and point to the email. Never invent facts, projects, dates, or metrics beyond what's below.

# About ${OWNER.name}
- ${OWNER.name} — ${OWNER.tagline}. Roles (newest first): ${roles}. The first role is current — reason about tenure against today's date, given below.
- By the numbers: ${stats}.
- Sits between stakeholders and engineering, turning tangled multi-stakeholder requirements into things teams can ship. Cares about "the boring middle": the requirements nobody writes, the production edge case, the graceful fallback.
- Contact: ${OWNER_EMAIL}.

# Projects
${projects}

# Site navigation (you can point people to these)
- ${nav}

# Sending a message
If a visitor wants to get in touch, hire ${OWNER.name}, or leave a message, collect their name, email, and message and use the send_contact_message tool to deliver it. Confirm the details back to them first, then call the tool. Don't call the tool without an actual message to send. If someone just wants the email address, give them ${OWNER_EMAIL}.`;
}

const SYSTEM_PROMPT = buildSystemPrompt();

const tools = [
  {
    type: "function",
    function: {
      name: "send_contact_message",
      description:
        "Deliver a visitor's message to Min Yi. Use only when the visitor has actually provided a message they want passed on, along with their name and a contact email.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The visitor's name" },
          email: { type: "string", description: "The visitor's email address" },
          message: { type: "string", description: "The message to deliver" },
        },
        required: ["name", "email", "message"],
      },
    },
  },
];

/** Executes a tool call server-side. Returns a short result string for the model. */
async function runTool(name: string, argsJson: string): Promise<string> {
  if (name !== "send_contact_message") return "Unknown tool.";
  let args: { name?: string; email?: string; message?: string };
  try {
    args = JSON.parse(argsJson || "{}");
  } catch {
    return "Could not read the message details.";
  }
  const { name: from, email, message } = args;

  // Deliver via Resend if configured (add RESEND_API_KEY in Vercel env vars).
  // Without it, we log and still acknowledge so the UX doesn't break.
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("[aria] contact message (no RESEND_API_KEY set):", { from, email, message });
    return "Message received and recorded. (Email delivery is not configured yet.)";
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "ARIA <onboarding@resend.dev>",
        to: [OWNER_EMAIL],
        reply_to: email,
        subject: `Portfolio message from ${from}`,
        text: `From: ${from} <${email}>\n\n${message}`,
      }),
    });
    return res.ok
      ? "Message delivered to Min Yi successfully."
      : "Sorry, the message could not be delivered right now.";
  } catch {
    return "Sorry, the message could not be delivered right now.";
  }
}

/**
 * Reads the nightly GitHub summary from Vercel KV. Returns a prompt section
 * (with a leading newline) or "" if unavailable. Never throws — GitHub context
 * is a nice-to-have, so any failure just drops the section silently.
 */
async function readGithubSummary(): Promise<string> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return "";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["GET", "aria:github"]),
    });
    if (!res.ok) return "";
    // KV REST returns { result: <stored string> | null }.
    const { result } = (await res.json()) as { result: string | null };
    if (!result) return "";
    return `\n\n# Recent GitHub activity\n${result}\nMention this only if the visitor asks about recent or current work.`;
  } catch {
    return "";
  }
}

interface ClientMessage {
  role: "user" | "assistant";
  content: string;
}

// Accumulates streamed OpenAI-style tool_call deltas by index.
interface ToolCallAcc {
  id: string;
  name: string;
  args: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!process.env.GROQ_API_KEY) return new Response("Server not configured", { status: 500 });

  let clientMessages: ClientMessage[];
  try {
    const body = (await req.json()) as { messages?: ClientMessage[] };
    clientMessages = body.messages ?? [];
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  if (!Array.isArray(clientMessages) || clientMessages.length === 0 || clientMessages.length > 40) {
    return new Response("Bad request", { status: 400 });
  }

  // Today's date, computed per request (Singapore time — the site's timezone) so
  // ARIA never relies on a hardcoded "now" when reasoning about roles/tenure.
  const today = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Singapore",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  // Recent GitHub activity, refreshed nightly by api/refresh-github.ts into KV.
  // Read-only and best-effort: if KV isn't configured or empty, ARIA just omits
  // this section rather than failing.
  const githubSection = await readGithubSummary();

  // OpenAI-format message history: system prompt first, then the conversation.
  const convo: Record<string, unknown>[] = [
    {
      role: "system",
      content:
        `${SYSTEM_PROMPT}\n\n# Today\nToday's date is ${today}. Use it for any "current"/"how long" reasoning.` +
        githubSection,
    },
    ...clientMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) })),
  ];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Agentic loop: stream text to the client; if the model wants a tool,
        // run it, feed the result back, and continue until it's done.
        for (let step = 0; step < 4; step++) {
          const res = await fetch(GROQ_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: MODEL,
              messages: convo,
              tools,
              tool_choice: "auto",
              max_tokens: 1024,
              stream: true,
            }),
          });
          if (!res.ok || !res.body) throw new Error(`Groq HTTP ${res.status}`);

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let assistantText = "";
          const toolCalls: ToolCallAcc[] = [];
          let finish = "";

          // Parse the Server-Sent Events stream line by line.
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const data = trimmed.slice(5).trim();
              if (data === "[DONE]") continue;
              let json: any;
              try {
                json = JSON.parse(data);
              } catch {
                continue;
              }
              const choice = json.choices?.[0];
              if (!choice) continue;
              const delta = choice.delta ?? {};
              if (delta.content) {
                assistantText += delta.content;
                controller.enqueue(encoder.encode(delta.content));
              }
              for (const tc of delta.tool_calls ?? []) {
                const i = tc.index ?? 0;
                toolCalls[i] ??= { id: "", name: "", args: "" };
                if (tc.id) toolCalls[i].id = tc.id;
                if (tc.function?.name) toolCalls[i].name += tc.function.name;
                if (tc.function?.arguments) toolCalls[i].args += tc.function.arguments;
              }
              if (choice.finish_reason) finish = choice.finish_reason;
            }
          }

          if (finish !== "tool_calls" || toolCalls.length === 0) break;

          // Record the assistant's tool-call turn, then run each tool.
          convo.push({
            role: "assistant",
            content: assistantText || null,
            tool_calls: toolCalls.map((t) => ({
              id: t.id,
              type: "function",
              function: { name: t.name, arguments: t.args },
            })),
          });
          for (const t of toolCalls) {
            const result = await runTool(t.name, t.args);
            convo.push({ role: "tool", tool_call_id: t.id, content: result });
          }
        }
      } catch (err) {
        console.error("[aria] stream error:", err);
        controller.enqueue(
          encoder.encode(
            "\n\nSorry — something went wrong on my end. You can reach Min Yi directly at " +
              OWNER_EMAIL +
              ".",
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
