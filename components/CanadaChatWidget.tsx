"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { chatStarters } from "@/lib/ircc-knowledge";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

export function CanadaChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, busy]);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || busy) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      const json = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !json.reply) {
        throw new Error(json.error || "Chat unavailable right now.");
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: json.reply!,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Chat unavailable. Please try WhatsApp or IRCC.",
      );
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(input);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <div className="flex h-[min(70vh,560px)] w-[min(100vw-2rem,380px)] flex-col overflow-hidden border border-line bg-white shadow-xl">
          <div className="flex items-start justify-between gap-3 bg-ink px-4 py-3 text-white">
            <div>
              <p className="text-sm font-bold tracking-wide">
                Canada relocation chat
              </p>
              <p className="mt-0.5 text-[11px] text-white/70">
                Answers grounded in IRCC / Canada.ca topics
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center border border-white/20 text-sm font-semibold hover:bg-white/10"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-cream/60 px-3 py-3">
            <div className="border border-line bg-paper px-3 py-2.5 text-xs leading-relaxed text-muted">
              Ask about Express Entry, work/study permits, visitor visas, and
              settling in Canada. General guidance only — verify on{" "}
              <a
                href="https://www.canada.ca/en/immigration-refugees-citizenship.html"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-teal underline"
              >
                IRCC
              </a>
              .
            </div>

            {messages.length === 0 ? (
              <div className="flex flex-wrap gap-2">
                {chatStarters.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => void ask(starter)}
                    className="border border-line bg-white px-2.5 py-2 text-left text-xs font-semibold text-ink hover:border-teal"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            ) : null}

            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`max-w-[92%] whitespace-pre-wrap px-3 py-2 text-sm leading-relaxed ${
                    isUser
                      ? "ml-auto bg-ink text-white"
                      : "mr-auto border border-line bg-white text-ink"
                  }`}
                >
                  {message.content}
                </div>
              );
            })}

            {busy ? (
              <p className="text-xs font-semibold text-muted">Thinking…</p>
            ) : null}

            {error ? (
              <p className="border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger">
                {error}
              </p>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={onSubmit}
            className="flex gap-2 border-t border-line bg-white p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about relocating to Canada…"
              className="min-h-11 flex-1 border border-line px-3 text-sm outline-none focus:border-teal"
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="btn-primary px-4 text-sm disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-12 items-center gap-2 bg-teal px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-teal-bright"
        aria-expanded={open}
      >
        <span aria-hidden>🍁</span>
        {open ? "Close" : "Canada help"}
      </button>
    </div>
  );
}
