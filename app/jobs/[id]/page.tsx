import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedJobWithRecruiter } from "@/lib/recruiter/store";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = await getPublishedJobWithRecruiter(id);
  if (!job) return { title: "Job not found" };
  return {
    title: job.title,
    description: `${job.companyName} — ${job.location}`,
  };
}

function formatType(type: string) {
  return type.replace("-", " ");
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const job = await getPublishedJobWithRecruiter(id);
  if (!job) notFound();

  const mailto = job.recruiterEmail
    ? `mailto:${encodeURIComponent(job.recruiterEmail)}?subject=${encodeURIComponent(`Application: ${job.title}`)}`
    : null;

  return (
    <div className="bg-cream">
      <article className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-20">
        <Link
          href="/jobs"
          className="text-sm font-semibold text-teal underline-offset-2 hover:underline"
        >
          ← All jobs
        </Link>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-teal">
          {formatType(job.employmentType)}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink md:text-4xl">
          {job.title}
        </h1>
        <p className="mt-2 text-muted">
          {job.companyName} · {job.location}
        </p>
        {job.salaryLabel ? (
          <p className="mt-3 text-sm font-semibold text-teal">{job.salaryLabel}</p>
        ) : null}

        {mailto ? (
          <a href={mailto} className="btn-primary mt-8 inline-flex px-6 py-3.5 text-sm">
            Apply by email
          </a>
        ) : null}

        <section className="mt-10">
          <h2 className="text-lg font-bold text-ink">About the role</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">
            {job.description}
          </p>
        </section>
        <section className="mt-8">
          <h2 className="text-lg font-bold text-ink">Requirements</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">
            {job.requirements}
          </p>
        </section>
      </article>
    </div>
  );
}
