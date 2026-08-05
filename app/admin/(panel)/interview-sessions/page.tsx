import type { Metadata } from "next";
import { InterviewSessionsTable } from "@/components/admin/InterviewSessionsTable";
import { getStore } from "@/lib/admin/store";

export const metadata: Metadata = { title: "Interview Sessions" };

export default async function AdminInterviewSessionsPage() {
  const store = await getStore();
  return (
    <div>
      <h1 className="text-xl font-bold text-ink sm:text-2xl">
        Interview Sessions
      </h1>
      <p className="mt-1 text-sm text-muted">
        Candidates who practised AI voice interviews — open a session to see
        score, corrections, transcript, and listen to the recording.
      </p>
      <div className="mt-6">
        <InterviewSessionsTable sessions={store.interviewSessions} />
      </div>
    </div>
  );
}
