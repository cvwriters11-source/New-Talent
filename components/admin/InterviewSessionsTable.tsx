"use client";

import Link from "next/link";
import type { AdminInterviewSession } from "@/lib/admin/supabase-data";

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleString("en-ZA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function statusLabel(status: AdminInterviewSession["status"]) {
  switch (status) {
    case "registered":
      return "Registered";
    case "in_progress":
      return "In progress";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

export function InterviewSessionsTable({
  sessions,
}: {
  sessions: AdminInterviewSession[];
}) {
  if (sessions.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-paper p-6 text-sm text-muted">
        No interview prep signups yet. New sessions will appear here when
        candidates start the wizard.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {sessions.map((session) => (
          <article
            key={session.id}
            className="rounded-xl border border-line bg-paper p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-ink">
                  {session.firstName} {session.surname}
                </p>
                <p className="mt-1 text-sm text-muted">{session.position}</p>
              </div>
              <p className="text-lg font-bold text-teal">
                {session.overallScore ?? "—"}
              </p>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Status</dt>
                <dd className="font-semibold text-teal">
                  {statusLabel(session.status)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Interviewer</dt>
                <dd className="capitalize">{session.interviewer || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Audio clips</dt>
                <dd>{session.audioClips.length}</dd>
              </div>
            </dl>
            <Link
              href={`/admin/interview-sessions/${session.id}`}
              className="mt-4 inline-flex text-sm font-semibold text-teal underline underline-offset-2"
            >
              View results & listen
            </Link>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-line bg-paper shadow-sm md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-paper-deep text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Candidate</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Audio</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-t border-line">
                <td className="px-4 py-3 font-semibold text-ink">
                  {session.firstName} {session.surname}
                  <p className="font-normal text-muted">{session.email}</p>
                </td>
                <td className="px-4 py-3">{session.position}</td>
                <td className="px-4 py-3 font-bold text-teal">
                  {session.overallScore ?? "—"}
                </td>
                <td className="px-4 py-3">{statusLabel(session.status)}</td>
                <td className="px-4 py-3">{session.audioClips.length}</td>
                <td className="px-4 py-3 text-muted">
                  {formatDate(session.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/interview-sessions/${session.id}`}
                    className="font-semibold text-teal underline underline-offset-2"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
