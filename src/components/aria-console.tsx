import { ArrowUp, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BorderBeam } from "@/components/ui/border-beam";
import { PastelGlassButton } from "@/components/ui/pastel-glass-button";

interface Message {
  id: number;
  role: "user" | "agent";
  text: string;
}

interface AriaConsoleProps {
  open: boolean;
  onClose: () => void;
}

/** Conversation starters — mirror the hero's action pills. */
const SUGGESTIONS = [
  "What has Min Yi built?",
  "Tell me about Nomo",
  "How do I get in touch?",
];

const GREETING =
  "Hi, I'm A.R.I.A, Min Yi's portfolio assistant. Ask me anything about the work, the projects, or how to get in touch.";

const FALLBACK_REPLY =
  "Sorry — I couldn't reach the server just now. You can reach Min Yi directly at seetminyi.work@gmail.com.";

export function AriaConsole({ open, onClose }: AriaConsoleProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "agent", text: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const idRef = useRef(1);

  // Auto-scroll to the newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  // Focus the input when the console opens; close on Escape.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    const userMsg: Message = { id: idRef.current++, role: "user", text: trimmed };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setThinking(true);

    const agentId = idRef.current++;
    try {
      const res = await fetch("/api/aria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the conversation in Claude's format; drop the canned greeting
        // (id 0) so the first message is a real user turn.
        body: JSON.stringify({
          messages: history
            .filter((m) => m.id !== 0)
            .map((m) => ({
              role: m.role === "user" ? "user" : "assistant",
              content: m.text,
            })),
        }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      // First byte on the way — swap the typing dots for a live message.
      setThinking(false);
      setMessages((m) => [...m, { id: agentId, role: "agent", text: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) =>
          m.map((msg) => (msg.id === agentId ? { ...msg, text: acc } : msg)),
        );
      }
    } catch {
      setMessages((m) => [
        ...m.filter((msg) => msg.id !== agentId),
        { id: agentId, role: "agent", text: FALLBACK_REPLY },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-40 flex items-end justify-center sm:items-end sm:justify-end sm:p-6 ${
        open ? "" : "pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close console"
        onClick={onClose}
        className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Console panel */}
      <div
        role="dialog"
        aria-label="A.R.I.A console"
        className={`relative flex h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white/70 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 sm:h-[600px] sm:rounded-3xl ${
          open
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }`}
      >
        {/* Pastel glow bleeding through the frosted glass */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "conic-gradient(from 0deg, #ffd1dc, #ffe0b3, #fff5ba, #c8f7d4, #b3e5ff, #d7c9ff, #ffd1dc)",
          }}
        />

        {/* Pastel beam riding the border — speeds up while A.R.I.A is thinking */}
        <BorderBeam
          radius={24}
          thickness={0.25}
          glow={2}
          duration={thinking ? 2.5 : 8}
        />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-black/5 px-5 py-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] text-black/55 uppercase">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(18,183,106,0.15)]" />
              <span>a.r.i.a · online</span>
            </div>
            <p
              className="mt-1 text-[17px] font-medium tracking-tight text-neutral-900"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ask the agent
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/60 text-black/60 transition-colors hover:bg-black hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="relative flex-1 space-y-4 overflow-y-auto px-5 py-5"
        >
          {messages.map((m) =>
            m.role === "agent" ? (
              <div key={m.id} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/70">
                  <Sparkles className="h-3 w-3 text-black/60" />
                </span>
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-black/5 bg-white/80 px-3.5 py-2.5 text-[14px] leading-relaxed text-neutral-800">
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-neutral-900 px-3.5 py-2.5 text-[14px] leading-relaxed text-white">
                  {m.text}
                </div>
              </div>
            ),
          )}

          {thinking && (
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/70">
                <Sparkles className="h-3 w-3 text-black/60" />
              </span>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-black/5 bg-white/80 px-3.5 py-3">
                <Dot delay="0ms" />
                <Dot delay="150ms" />
                <Dot delay="300ms" />
              </div>
            </div>
          )}
        </div>

        {/* Suggestions (only before the first user message) */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-1.5 px-5 pb-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-[12.5px] text-black/70 transition-colors hover:bg-black hover:text-white"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="relative border-t border-black/5 p-3"
        >
          <div className="flex items-end gap-2 rounded-2xl border border-black/10 bg-white/70 px-3 py-2 focus-within:border-black/25">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Message A.R.I.A…"
              className="max-h-32 flex-1 resize-none bg-transparent py-1 text-[14px] text-neutral-900 placeholder:text-black/35 focus:outline-none"
            />
            <PastelGlassButton
              type="submit"
              aria-label="Send"
              label=""
              icon={<ArrowUp className="h-4 w-4" />}
              disabled={!input.trim() || thinking}
              className="aurora-button--cta aurora-button--icon shrink-0"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-black/40"
      style={{ animationDelay: delay }}
    />
  );
}
