import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCandidateSession } from "@/lib/interview/auth";
import {
  completeSession,
  getSession,
  getTurnsForSession,
} from "@/lib/interview/store";
import { summariseSessionScores } from "@/lib/interview/score";

export default async function InterviewResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await getCandidateSession();
  if (!auth) redirect("/interview");

  const { id } = await params;
  let session = await getSession(id);
  if (!session || session.candidateId !== auth.id) notFound();

  const turns = await getTurnsForSession(id);

  if (session.status === "pending" || session.status === "in_progress") {
    const summary = summariseSessionScores(turns);
    session =
      (await completeSession(id, {
        overallScore: summary.overallScore,
        summaryFeedback: summary.summaryFeedback,
        fixAreas: summary.fixAreas,
        status: "completed",
      })) ?? session;
  }

  const answered = turns.filter((t) => t.answerTranscript);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-wider text-teal">
        Session complete
      </p>
      <h1 className="mt-2 text-3xl font-bold text-ink">Your interview score</h1>
      <p className="mt-2 text-muted">{session.summaryFeedback}</p>

      <div className="mt-8 flex items-end gap-4 rounded-2xl border border-line bg-white p-6 shadow-sm">
        <p className="text-6xl font-bold text-ink">
          {session.overallScore ?? 0}
          <span className="text-2xl text-muted">%</span>
        </p>
        <div className="pb-2 text-sm text-muted">
          <p>{session.durationMinutes} minute session</p>
          <p>
            {answered.length} answered · {session.status.replace("_", " ")}
          </p>
        </div>
      </div>

      {session.fixAreas.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-ink">Where you should fix</h2>
          <ul className="mt-3 space-y-2">
            {session.fixAreas.map((area) => (
              <li
                key={area}
                className="rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink"
              >
                {area}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-bold text-ink">Questions & answers</h2>
        <div className="mt-4 space-y-4">
          {turns.map((t, i) => (
            <article
              key={t.id}
              className="rounded-xl border border-line bg-white p-5"
            >
              <p className="text-xs font-semibold uppercase text-muted">
                Q{i + 1}
                {t.score != null ? ` · ${t.score}/10` : ""}
              </p>
              <p className="mt-1 font-semibold text-ink">{t.questionText}</p>
              <p className="mt-3 text-sm text-muted">
                {t.answerTranscript || "(No answer recorded)"}
              </p>
              {t.feedback && (
                <p className="mt-2 text-sm text-teal">{t.feedback}</p>
              )}
              {t.fixAreas.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-xs text-muted">
                  {t.fixAreas.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/interview/dashboard" className="btn-primary">
          Practise again
        </Link>
        <Link
          href="/packages"
          className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink"
        >
          View career packages
        </Link>
      </div>
    </div>
  );
}
