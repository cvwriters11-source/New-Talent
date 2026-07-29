"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Mode = "login" | "register";

export function InterviewAuthForms({
  initialMode = "register",
  nextPath = "/interview/dashboard",
}: {
  initialMode?: Mode;
  nextPath?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        mode === "register" ? "/api/interview/register" : "/api/interview/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "register"
              ? { name, email, password, whatsapp }
              : { email, password },
          ),
        },
      );
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex rounded-lg bg-paper-deep p-1">
        {(["register", "login"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`flex-1 rounded-md py-2 text-sm font-semibold capitalize transition ${
              mode === m ? "bg-ink text-white" : "text-muted hover:text-ink"
            }`}
          >
            {m === "register" ? "Register" : "Log in"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === "register" && (
          <>
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-ink">Full name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-ink"
                autoComplete="name"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-ink">
                WhatsApp <span className="font-normal text-muted">(optional)</span>
              </span>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-ink"
                autoComplete="tel"
              />
            </label>
          </>
        )}

        <label className="block text-sm">
          <span className="mb-1.5 block font-semibold text-ink">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-ink"
            autoComplete="email"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-1.5 block font-semibold text-ink">Password</span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-ink"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            minLength={6}
          />
        </label>

        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center disabled:opacity-60"
        >
          {loading
            ? "Please wait…"
            : mode === "register"
              ? "Create free account"
              : "Log in & practise"}
        </button>
      </form>
    </div>
  );
}
