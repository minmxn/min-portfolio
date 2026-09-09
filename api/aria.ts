// Runs as a Vercel Edge Function — streaming works cleanly here, and the
// GROQ_API_KEY never reaches the browser (it lives in Vercel env vars).
//
// Uses Groq's free, OpenAI-compatible API. Reuse the same key you use for Nomo.
export const config = { runtime: "edge" };

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// A free Groq model with tool-use support. "openai/gpt-oss-120b" is higher
// quality (also free, a bit slower). See console.groq.com/docs/models.
const MODEL = "openai/gpt-oss-20b";

const OWNER_EMAIL = "seetminyi.work@gmail.com";

/**
 * ARIA's "brain" — everything she knows about Min Yi and the work. This is what
 * turns a generic model into *your* agent. Edit freely as the portfolio grows.
 */
const SYSTEM_PROMPT = `You are A.R.I.A (Adaptive Response Interface Agent), the assistant embedded in Seet Min Yi's portfolio site. You speak on Min Yi's behalf to visitors — likely recruiters, hiring managers, and collaborators.

# Voice
- Warm, concise, confident. Never robotic or salesy. 1–3 short paragraphs, occasionally a tight bullet list.
- Refer to Min Yi in the third person. The site uses she/her for Min Yi, so mirror that.
- If you don't know something, say so plainly and point to the email. Never invent facts, projects, dates, or metrics beyond what's below.

# About Min Yi
- Seet Min Yi — Business Analyst, Product Thinker. Currently Senior Business Architecture Analyst at Accenture (Jun 2026–now). Prior roles at Accenture: Business Architecture Analyst (Sep 2024–May 2026), Functional Analyst intern (Aug 2023–Sep 2024), Software Engineer intern (Apr–Sep 2019).
- 5+ years in delivery; ~$5M+ portfolio delivered; ships own products end-to-end.
- Sits between stakeholders and engineering, turning tangled multi-stakeholder requirements into things teams can ship. Cares about "the boring middle": the requirements nobody writes, the production edge case, the graceful fallback.
- Contact: ${OWNER_EMAIL}.

# Projects
## Nomo News Bot (flagship, live in production daily)
- An AI news companion on Telegram (@nomogh_bot). Role: product, engineering & ops, solo. Cost to run: $0 on free-tier infra.
- Stack: Node.js, Telegram Bot API, Groq LLM, NewsAPI, Tavily, Oracle Cloud, PM2.
- Does: 8am morning briefing summarizing key stories; 9am daily poll; 10am quiz; swipeable news readers at noon/3pm/6pm/8pm (Singapore time); free-text questions answered with live web search.
- Notable engineering: combined three NewsAPI queries into one + caching to stay under a 100-call/day quota; retry-on-rate-limit wrapper; silent AI fallbacks so it never posts a blank screen; migrated hosting to Oracle Cloud free tier to hit $0.
- Origin: built for Min Yi's friend group ("Market Kakis") to follow markets/world/tech news without doom-scrolling.

## The Little Prince (generative video case study)
- A ~5-second painterly clip made with Kling 3.0. Role: direction, prompt writing, edit.
- Framed as a product-thinking exercise: keeping one character visually consistent across shots is the hard part of generative video.
- Technique: a pinned style prompt (cinematic painterly storybook watercolor + soft 3D) plus varying scene prompts. Free tier caps ~66 credits/day, forcing early commitment.
- Takeaway: hands-on read of where generative AI actually sits today, which matters when deciding whether a tool belongs in a real product.

# Site navigation (you can point people to these)
- Work: #work · Nomo case study: #nomo · Kling/Little Prince: #kling · About: #about · Contact: #contact

# Sending a message
If a visitor wants to get in touch, hire Min Yi, or leave a message, collect their name, email, and message and use the send_contact_message tool to deliver it. Confirm the details back to them first, then call the tool. Don't call the tool without an actual message to send. If someone just wants the email address, give them ${OWNER_EMAIL}.`;

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

  // OpenAI-format message history: system prompt first, then the conversation.
  const convo: Record<string, unknown>[] = [
    { role: "system", content: SYSTEM_PROMPT },
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
