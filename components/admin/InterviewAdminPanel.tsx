"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { InterviewCandidate, InterviewSession } from "@/lib/interview/store";

type SessionRow = InterviewSession & {
  candidateName: string;
  candidateEmail: string;
};

type CandidateRow = InterviewCandidate & { sessionCount: number };

export function InterviewAdminPanel() {
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{
    session: InterviewSession;
    turns: {
      id: string;
      questionText: string;
      answerTranscript: string | null;
      score: number | null;
      feedback: string | null;
      fixAreas: string[];
      audioUrl: string | null;
    }[];
    candidate: InterviewCandidate | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/interview");
        const json = (await res.json()) as {
          error?: string;
          candidates?: CandidateRow[];
          sessions?: SessionRow[];
        };
        if (!res.ok) throw new Error(json.error || "Failed to load");
        setCandidates(json.candidates || []);
        setSessions(json.sessions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function openSession(id: string) {
    setSelectedId(id);
    setDetail(null);
    const res = await fetch(`/api/admin/interview?sessionId=${id}`);
    const json = await res.json();
    if (res.ok) setDetail(json);
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading interview data…</p>;
  }

  if (error) {
    return <p className="text-sm text-danger">{error}</p>;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-bold text-ink">Candidates & logins</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-paper-deep text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Last login</th>
                <th className="px-4 py-3">Sessions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-muted">
                    No candidates registered yet.
                  </td>
                </tr>
              ) : (
                candidates.map((c) => (
                  <tr key={c.id} className="border-b border-line/70">
                    <td className="px-4 py-3 font-semibold">{c.name}</td>
                    <td className="px-4 py-3">{c.email}</td>
                    <td className="px-4 py-3 text-muted">
                      {c.lastLoginAt
                        ? new Date(c.lastLoginAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">{c.sessionCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-ink">Practice sessions</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-paper-deep text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-line/70">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{s.candidateName}</p>
                    <p className="text-xs text-muted">{s.candidateEmail}</p>
                  </td>
                  <td className="px-4 py-3">{s.durationMinutes} min</td>
                  <td className="px-4 py-3 capitalize">
                    {s.status.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3">
                    {s.overallScore != null ? `${s.overallScore}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void openSession(s.id)}
                      className="text-sm font-semibold text-teal underline"
                    >
                      View Q&A
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedId && detail && (
        <section className="rounded-2xl border border-line bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-ink">
                {detail.candidate?.name ?? "Candidate"} — session detail
              </h2>
              <p className="text-sm text-muted">
                {detail.candidate?.email} · {detail.session.durationMinutes} min ·{" "}
                {detail.session.accessTier}
              </p>
            </div>
            <button
              type="button"
              className="text-sm text-muted underline"
              onClick={() => {
                setSelectedId(null);
                setDetail(null);
              }}
            >
              Close
            </button>
          </div>

          {detail.session.summaryFeedback && (
            <p className="mt-4 text-sm text-ink">{detail.session.summaryFeedback}</p>
          )}

          <div className="mt-6 space-y-4">
            {detail.turns.map((t, i) => (
              <article key={t.id} className="rounded-xl bg-paper-deep p-4">
                <p className="text-xs font-bold uppercase text-muted">
                  Q{i + 1}
                  {t.score != null ? ` · ${t.score}/10` : ""}
                </p>
                <p className="mt-1 font-semibold">{t.questionText}</p>
                <p className="mt-2 text-sm text-muted">
                  <span className="font-semibold text-ink">Answer: </span>
                  {t.answerTranscript || "(none)"}
                </p>
                {t.feedback && (
                  <p className="mt-2 text-sm text-teal">{t.feedback}</p>
                )}
                {t.audioUrl && (
                  <audio className="mt-3 w-full" controls src={t.audioUrl} />
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <p className="text-xs text-muted">
        Need package orders?{" "}
        <Link href="/admin/orders" className="underline">
          View orders
        </Link>
      </p>
    </div>
  );
}
