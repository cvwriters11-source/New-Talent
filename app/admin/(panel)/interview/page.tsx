import { InterviewAdminPanel } from "@/components/admin/InterviewAdminPanel";

export const metadata = {
  title: "Interview Prep | Admin",
};

export default function AdminInterviewPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Interview Prep</h1>
        <p className="mt-1 text-sm text-muted">
          See who registered, when they last logged in, and full interview Q&A
          with scores.
        </p>
      </div>
      <InterviewAdminPanel />
    </div>
  );
}
