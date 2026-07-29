import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { RecruiterJobForm } from "@/components/recruiter/RecruiterJobForm";
import { getRecruiterSession } from "@/lib/recruiter/auth";
import { getJob } from "@/lib/recruiter/store";

export const metadata: Metadata = {
  title: "Edit Job Post",
};

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditJobPage({ params }: Props) {
  const session = await getRecruiterSession();
  if (!session) redirect("/recruiter/login");

  const { id } = await params;
  const job = await getJob(id);
  if (!job || job.recruiterId !== session.id) notFound();

  return (
    <div className="mx-auto max-w-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold text-ink">Edit job</h1>
      <p className="mt-1 text-sm text-muted">{job.title}</p>
      <div className="mt-6">
        <RecruiterJobForm
          mode="edit"
          job={job}
          defaultCompany={session.company}
        />
      </div>
    </div>
  );
}
