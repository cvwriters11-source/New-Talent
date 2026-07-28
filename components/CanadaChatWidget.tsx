"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { chatStarters } from "@/lib/ircc-knowledge";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };

const PROACTIVE_KEY = "tc_canada_chat_proactive_v1";
const PROACTIVE_DELAY_MS = 2 * 60 * 1000;

const PROACTIVE_MESSAGE =
  "Hi — welcome to Talent Crafters. Planning a move to Canada? I can help with Express Entry, work or study permits, visitor visas, and settling basics. Ask me anything, or tap a topic below.";

function MessageIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H7l-4 3V12A8.5 8.5 0 1 1 21 12Z" />
      <path d="M8 11h.01M12 11h.01M16 11h.01" />
    </svg>
  );
}

export function CanadaChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const engagedRef = useRef(false);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnread(false);
      setPreviewOpen(false);
    }
  }, [messages, open, busy]);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    try {
      if (sessionStorage.getItem(PROACTIVE_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    timer = window.setTimeout(() => {
      if (cancelled || engagedRef.current) return;

      const proactive: ChatMessage = {
        id: `a-proactive-${Date.now()}`,
        role: "assistant",
        content: PROACTIVE_MESSAGE,
      };

      setMessages((prev) => (prev.length === 0 ? [proactive] : prev));
      setPreviewOpen(true);
      setUnread(true);

      try {
        sessionStorage.setItem(PROACTIVE_KEY, "1");
      } catch {
        /* ignore */
      }
    }, PROACTIVE_DELAY_MS);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || busy) return;

    engagedRef.current = true;
    setPreviewOpen(false);

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

  function openChat() {
    setOpen(true);
    setPreviewOpen(false);
    setUnread(false);
    engagedRef.current = true;
  }

  function dismissPreview() {
    setPreviewOpen(false);
    setUnread(false);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <div
          className="flex h-[min(80vh,680px)] w-[min(100vw-1.25rem,440px)] flex-col overflow-hidden border border-line bg-white shadow-2xl"
          role="dialog"
          aria-label="Canada relocation chat"
        >
          <div className="flex items-center gap-3 bg-ink px-4 py-3 text-white">
            <div className="relative flex h-10 w-10 items-center justify-center bg-white/10">
              <MessageIcon className="h-5 w-5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 border-2 border-ink bg-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold tracking-wide">Canada help</p>
              <p className="text-[11px] text-white/70">
                Online · IRCC-guided answers
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center border border-white/20 text-lg font-semibold hover:bg-white/10"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#f3f6fb] px-3 py-3">
            <div className="border border-line bg-white px-3 py-2.5 text-xs leading-relaxed text-muted">
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
                  className={`max-w-[88%] whitespace-pre-wrap px-3 py-2.5 text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? "ml-auto bg-ink text-white"
                      : "mr-auto border border-line bg-white text-ink"
                  }`}
                >
                  {!isUser ? (
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-teal">
                      Canada help
                    </p>
                  ) : null}
                  {message.content}
                </div>
              );
            })}

            {messages.length > 0 &&
            messages.every((m) => m.role === "assistant") ? (
              <div className="flex flex-wrap gap-2">
                {chatStarters.slice(0, 3).map((starter) => (
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

            {busy ? (
              <p className="text-xs font-semibold text-muted">Typing…</p>
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
              placeholder="Type your message…"
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

      {!open && previewOpen ? (
        <div className="w-[min(100vw-1.25rem,360px)] border border-line bg-white p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-ink text-white">
              <MessageIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-ink">Canada help</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {PROACTIVE_MESSAGE}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={openChat}
                  className="btn-primary px-3 py-2 text-xs"
                >
                  Reply
                </button>
                <button
                  type="button"
                  onClick={dismissPreview}
                  className="border border-line bg-white px-3 py-2 text-xs font-semibold text-muted"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openChat())}
        className="relative inline-flex h-16 w-16 items-center justify-center bg-ink text-white shadow-lg transition hover:bg-ink-soft sm:h-[4.5rem] sm:w-[4.5rem]"
        aria-expanded={open}
        aria-label={open ? "Close Canada help chat" : "Open Canada help chat"}
      >
        {open ? (
          <span className="text-2xl leading-none">×</span>
        ) : (
          <MessageIcon className="h-7 w-7" />
        )}
        {unread && !open ? (
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 border-2 border-cream bg-emerald-400" />
        ) : null}
        {!open ? (
          <span className="absolute bottom-1 right-1 h-3 w-3 border-2 border-ink bg-emerald-400" />
        ) : null}
      </button>
    </div>
  );
}
