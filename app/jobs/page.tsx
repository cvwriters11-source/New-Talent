import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedJobs } from "@/lib/recruiter/store";

export const metadata: Metadata = {
  title: "Jobs",
  description: "Open roles listed through Talent Crafters Career Development.",
};

export const dynamic = "force-dynamic";

function formatType(type: string) {
  return type.replace("-", " ");
}

export default async function JobsPage() {
  const jobs = await listPublishedJobs();

  return (
    <div className="bg-cream">
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal">
          Careers
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold text-ink md:text-4xl">
          Open roles from our recruiter partners
        </h1>
        <p className="mt-3 max-w-xl text-muted">
          Browse approved listings. Apply by emailing the hiring contact directly.
        </p>

        <div className="mt-12 space-y-4">
          {jobs.length === 0 ? (
            <p className="border border-line bg-paper px-5 py-12 text-center text-sm text-muted">
              No published roles right now. Check back soon.
            </p>
          ) : (
            jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block border border-line bg-paper px-5 py-5 transition hover:border-teal/40 hover:shadow-sm sm:px-6"
              >
                <div className="flex items-start gap-4">
                  {job.companyLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={job.companyLogoUrl}
                      alt=""
                      className="h-14 w-14 shrink-0 border border-line object-contain p-1"
                    />
                  ) : (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center border border-line bg-[#f8fafc] text-xs font-bold text-muted">
                      {job.companyName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-ink">{job.title}</h2>
                        <p className="mt-1 text-sm text-muted">
                          {job.companyName} · {job.location}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
                        {formatType(job.employmentType)}
                      </span>
                    </div>
                    {job.salaryLabel ? (
                      <p className="mt-3 text-sm font-semibold text-teal">
                        {job.salaryLabel}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted">Hiring?</p>
          <Link
            href="/recruiter/register"
            className="btn-primary inline-flex px-4 py-2.5 text-sm"
          >
            Post a role as a recruiter
          </Link>
        </div>
      </section>
    </div>
  );
}
