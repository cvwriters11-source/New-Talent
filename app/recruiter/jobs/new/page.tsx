import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RecruiterJobForm } from "@/components/recruiter/RecruiterJobForm";
import { getRecruiterSession } from "@/lib/recruiter/auth";
import { getRecruiterById } from "@/lib/recruiter/store";

export const metadata: Metadata = {
  title: "New Job Post",
};

export default async function NewJobPage() {
  const session = await getRecruiterSession();
  if (!session) redirect("/recruiter/login");

  const recruiter = await getRecruiterById(session.id);
  if (!recruiter) redirect("/recruiter/login");
  if (recruiter.verificationStatus !== "approved") {
    redirect("/recruiter/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold text-ink">Post a job</h1>
      <p className="mt-1 text-sm text-muted">
        Submitted listings are reviewed by Talent Crafters before going live.
        Your company logo will appear on the public listing.
      </p>
      <div className="mt-6">
        <RecruiterJobForm mode="create" defaultCompany={session.company} />
      </div>
    </div>
  );
}
