import type { Metadata } from "next";
import { AdminJobActions } from "@/components/admin/AdminJobActions";
import { JobStatusBadge } from "@/components/recruiter/JobStatusBadge";
import { listAllJobs } from "@/lib/recruiter/store";

export const metadata: Metadata = { title: "Job Posts" };

export const dynamic = "force-dynamic";

export default async function Page() {
  const jobs = await listAllJobs();
  return (
    <div>
      <h1 className="text-2xl font-bold">Job Posts</h1>
      <p className="mt-1 text-sm text-muted">
        Approve listings before they appear on the public Jobs board.
      </p>
      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        {jobs.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">
            No job posts yet.
          </p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f8fafc] text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Recruiter</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className="border-t border-line">
                  <td className="px-4 py-3 font-semibold">{j.title}</td>
                  <td className="px-4 py-3">{j.companyName}</td>
                  <td className="px-4 py-3">
                    <p>{j.recruiterName || "—"}</p>
                    <p className="text-xs text-muted">{j.recruiterEmail || j.contactEmail}</p>
                  </td>
                  <td className="px-4 py-3">{j.location}</td>
                  <td className="px-4 py-3">
                    <JobStatusBadge status={j.status} />
                  </td>
                  <td className="px-4 py-3">
                    <AdminJobActions jobId={j.id} currentStatus={j.status} />
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
