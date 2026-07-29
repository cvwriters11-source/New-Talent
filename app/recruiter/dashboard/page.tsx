import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { JobStatusBadge } from "@/components/recruiter/JobStatusBadge";
import { getRecruiterSession } from "@/lib/recruiter/auth";
import { getRecruiterById, listJobsForRecruiter } from "@/lib/recruiter/store";

export const metadata: Metadata = {
  title: "Recruiter Dashboard",
};

export const dynamic = "force-dynamic";

export default async function RecruiterDashboardPage() {
  const session = await getRecruiterSession();
  if (!session) redirect("/recruiter/login");

  const [recruiter, jobs] = await Promise.all([
    getRecruiterById(session.id),
    listJobsForRecruiter(session.id),
  ]);
  if (!recruiter) redirect("/recruiter/login");

  const verified = recruiter.verificationStatus === "approved";

  return (
    <div>
      {recruiter.verificationStatus === "pending" ? (
        <div className="mb-6 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Your registration is awaiting admin verification. You can sign in, but
          you cannot post jobs until Talent Crafters approves your account.
        </div>
      ) : null}
      {recruiter.verificationStatus === "rejected" ? (
        <div className="mb-6 border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          Your registration was rejected
          {recruiter.verificationNote ? `: ${recruiter.verificationNote}` : "."}{" "}
          Contact Talent Crafters if you need help.
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          {recruiter.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recruiter.logoUrl}
              alt={`${recruiter.company} logo`}
              className="h-14 w-14 border border-line bg-white object-contain p-1"
            />
          ) : null}
          <div>
            <h1 className="text-2xl font-bold text-ink">Your job posts</h1>
            <p className="mt-1 text-sm text-muted">
              New listings stay pending until an admin approves them for the public board.
            </p>
          </div>
        </div>
        {verified ? (
          <Link href="/recruiter/jobs/new" className="btn-primary px-5 py-3 text-sm">
            Post a job
          </Link>
        ) : (
          <span className="cursor-not-allowed px-5 py-3 text-sm font-semibold text-muted opacity-60">
            Post a job
          </span>
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        {jobs.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">
            {verified ? (
              <>
                No jobs yet.{" "}
                <Link
                  href="/recruiter/jobs/new"
                  className="font-semibold text-teal underline-offset-2 hover:underline"
                >
                  Create your first listing
                </Link>
              </>
            ) : (
              "No jobs yet. Posting unlocks after verification."
            )}
          </p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f8fafc] text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{job.title}</p>
                    <p className="text-xs text-muted">{job.companyName}</p>
                    {job.status === "rejected" && job.adminNote ? (
                      <p className="mt-1 text-xs text-danger">{job.adminNote}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted">{job.location}</td>
                  <td className="px-4 py-3">
                    <JobStatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/recruiter/jobs/${job.id}/edit`}
                      className="font-semibold text-teal underline-offset-2 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
