import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InterviewAudioPlayer } from "@/components/admin/InterviewAudioPlayer";
import { sbGetInterviewSession } from "@/lib/admin/supabase-data";

export const metadata: Metadata = { title: "Interview Session" };

export default async function AdminInterviewSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await sbGetInterviewSession(id);
  if (!session) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          href="/admin/interview-sessions"
          className="text-sm font-semibold text-teal underline underline-offset-2"
        >
          ← Interview Sessions
        </Link>
        <h1 className="mt-3 text-xl font-bold text-ink sm:text-2xl">
          {session.firstName} {session.surname}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {session.position} · {session.interviewer || "—"} ·{" "}
          {session.durationMinutes ? `${session.durationMinutes} min` : "—"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-paper p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">
            Score
          </p>
          <p className="mt-2 text-3xl font-bold text-teal">
            {session.overallScore ?? "—"}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-paper p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">
            Status
          </p>
          <p className="mt-2 text-lg font-semibold capitalize text-ink">
            {session.status.replace("_", " ")}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-paper p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">
            Contact
          </p>
          <p className="mt-2 text-sm text-ink">{session.email}</p>
          <p className="text-sm text-muted">{session.phone}</p>
        </div>
      </div>

      {session.results ? (
        <section className="rounded-xl border border-line bg-paper p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-bold text-ink">How it went</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {session.results.summary}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-bold text-ink">Strengths</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {session.results.strengths.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink">Improvements</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {session.results.improvements.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <h3 className="text-sm font-bold text-ink">Corrected answers</h3>
            {session.results.corrections.map((correction, index) => (
              <article
                key={`${correction.question}-${index}`}
                className="rounded-lg border border-line bg-paper-deep p-3"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-teal">
                  Q{index + 1}
                </p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {correction.question}
                </p>
                <p className="mt-2 text-xs text-muted">
                  Candidate: {correction.candidateAnswer}
                </p>
                <p className="mt-2 text-sm text-ink">
                  Better answer: {correction.betterAnswer}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-line bg-paper p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-bold text-ink">Listen to interview</h2>
        <div className="mt-4">
          <InterviewAudioPlayer clips={session.audioClips} />
        </div>
      </section>

      <section className="rounded-xl border border-line bg-paper p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-bold text-ink">Transcript</h2>
        <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto">
          {session.transcript.length === 0 ? (
            <p className="text-sm text-muted">No transcript saved.</p>
          ) : (
            session.transcript.map((line) => (
              <div
                key={line.id}
                className="rounded-lg border border-line bg-paper-deep px-3 py-2 text-sm"
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-teal">
                  {line.role}
                </p>
                <p className="mt-1 text-ink">{line.content}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
