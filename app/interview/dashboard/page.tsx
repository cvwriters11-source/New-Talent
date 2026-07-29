import Link from "next/link";
import { redirect } from "next/navigation";
import { InterviewLogoutButton } from "@/components/interview/InterviewLogoutButton";
import { StartInterviewForm } from "@/components/interview/StartInterviewForm";
import { getCandidateSession } from "@/lib/interview/auth";
import { listSessionsForCandidate } from "@/lib/interview/store";

export const metadata = {
  title: "Interview dashboard",
};

export default async function InterviewDashboardPage() {
  const auth = await getCandidateSession();
  if (!auth) redirect("/interview");

  const sessions = await listSessionsForCandidate(auth.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Welcome back</p>
          <h1 className="text-3xl font-bold text-ink">{auth.name}</h1>
        </div>
        <InterviewLogoutButton />
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <StartInterviewForm />
        </div>
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
            Past sessions
          </h2>
          {sessions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line bg-white p-6 text-sm text-muted">
              No practice sessions yet. Start your first free interview.
            </p>
          ) : (
            <ul className="space-y-2">
              {sessions.map((s) => (
                <li key={s.id}>
                  <Link
                    href={
                      s.status === "completed" || s.status === "abandoned"
                        ? `/interview/session/${s.id}/results`
                        : `/interview/session/${s.id}`
                    }
                    className="block rounded-xl border border-line bg-white px-4 py-3 transition hover:border-ink/30"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-ink">
                        {s.durationMinutes} min
                      </span>
                      <span className="text-xs capitalize text-muted">
                        {s.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {new Date(s.createdAt).toLocaleString()}
                      {s.overallScore != null
                        ? ` · Score ${s.overallScore}%`
                        : ""}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
