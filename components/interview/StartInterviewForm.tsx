"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  INTERVIEW_DURATIONS,
  type InterviewDuration,
} from "@/lib/interview/question-bank";

export function StartInterviewForm() {
  const router = useRouter();
  const [duration, setDuration] = useState<InterviewDuration>(15);
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/interview/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: duration,
          targetRole: targetRole || undefined,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        session?: { id: string };
      };
      if (!res.ok || !json.session) {
        throw new Error(json.error || "Could not start session.");
      }
      router.push(`/interview/session/${json.session.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={start}
      className="rounded-2xl border border-line bg-white p-6 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-lg font-bold text-ink">Start a practice interview</h2>
        <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-teal">
          Free
        </span>
      </div>
      <p className="mb-5 text-sm text-muted">
        Choose a length. The AI interviewer will ask aloud — answer with your mic
        (or type if needed).
      </p>

      <div className="mb-5 grid grid-cols-3 gap-2">
        {INTERVIEW_DURATIONS.map((mins) => (
          <button
            key={mins}
            type="button"
            onClick={() => setDuration(mins)}
            className={`rounded-xl border px-3 py-4 text-center transition ${
              duration === mins
                ? "border-ink bg-ink text-white"
                : "border-line bg-paper-deep text-ink hover:border-ink/40"
            }`}
          >
            <span className="block text-xl font-bold">{mins}</span>
            <span className="text-xs opacity-80">minutes</span>
          </button>
        ))}
      </div>

      <label className="mb-5 block text-sm">
        <span className="mb-1.5 block font-semibold text-ink">
          Target role{" "}
          <span className="font-normal text-muted">(optional)</span>
        </span>
        <input
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Customer Service, Administrator"
          className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-ink"
        />
      </label>

      {error && (
        <p className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center disabled:opacity-60"
      >
        {loading ? "Starting…" : "Begin voice interview"}
      </button>
    </form>
  );
}
