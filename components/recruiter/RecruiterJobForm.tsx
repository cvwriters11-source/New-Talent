"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { EmploymentType, JobPost } from "@/lib/recruiter/store";

const TYPES: { value: EmploymentType; label: string }[] = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "remote", label: "Remote" },
];

type Props = {
  mode: "create" | "edit";
  job?: JobPost;
  defaultCompany: string;
};

export function RecruiterJobForm({ mode, job, defaultCompany }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const payload = {
      title: String(data.get("title") || ""),
      companyName: String(data.get("companyName") || ""),
      location: String(data.get("location") || ""),
      employmentType: String(data.get("employmentType") || ""),
      description: String(data.get("description") || ""),
      requirements: String(data.get("requirements") || ""),
      salaryLabel: String(data.get("salaryLabel") || "") || undefined,
    };

    try {
      const res =
        mode === "create"
          ? await fetch("/api/recruiter/jobs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/recruiter/jobs/${job!.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Save failed");
      router.push("/recruiter/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-semibold text-ink">
          Job title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={job?.title}
          className="w-full min-h-12 border border-line bg-white px-3.5 py-3 text-sm outline-none focus:border-teal"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="companyName" className="mb-1.5 block text-sm font-semibold text-ink">
            Company
          </label>
          <input
            id="companyName"
            name="companyName"
            required
            defaultValue={job?.companyName || defaultCompany}
            className="w-full min-h-12 border border-line bg-white px-3.5 py-3 text-sm outline-none focus:border-teal"
          />
        </div>
        <div>
          <label htmlFor="location" className="mb-1.5 block text-sm font-semibold text-ink">
            Location
          </label>
          <input
            id="location"
            name="location"
            required
            defaultValue={job?.location}
            placeholder="e.g. Johannesburg / Remote"
            className="w-full min-h-12 border border-line bg-white px-3.5 py-3 text-sm outline-none focus:border-teal"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="employmentType" className="mb-1.5 block text-sm font-semibold text-ink">
            Employment type
          </label>
          <select
            id="employmentType"
            name="employmentType"
            required
            defaultValue={job?.employmentType || "full-time"}
            className="w-full min-h-12 border border-line bg-white px-3.5 py-3 text-sm outline-none focus:border-teal"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="salaryLabel" className="mb-1.5 block text-sm font-semibold text-ink">
            Salary <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="salaryLabel"
            name="salaryLabel"
            defaultValue={job?.salaryLabel || ""}
            placeholder="e.g. R25,000 – R35,000"
            className="w-full min-h-12 border border-line bg-white px-3.5 py-3 text-sm outline-none focus:border-teal"
          />
        </div>
      </div>
      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-semibold text-ink">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={6}
          defaultValue={job?.description}
          className="w-full border border-line bg-white px-3.5 py-3 text-sm outline-none focus:border-teal"
        />
      </div>
      <div>
        <label htmlFor="requirements" className="mb-1.5 block text-sm font-semibold text-ink">
          Requirements
        </label>
        <textarea
          id="requirements"
          name="requirements"
          required
          rows={5}
          defaultValue={job?.requirements}
          className="w-full border border-line bg-white px-3.5 py-3 text-sm outline-none focus:border-teal"
        />
      </div>
      {mode === "edit" && (job?.status === "rejected" || job?.status === "closed") ? (
        <p className="border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Saving will resubmit this job for admin approval.
        </p>
      ) : null}
      {mode === "edit" && job?.status === "published" ? (
        <p className="border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Editing a live job returns it to pending until an admin re-approves it.
        </p>
      ) : null}
      {error ? (
        <p className="border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-6 py-3 text-sm disabled:opacity-60"
        >
          {loading
            ? "Saving…"
            : mode === "create"
              ? "Submit for review"
              : "Save changes"}
        </button>
        <Link
          href="/recruiter/dashboard"
          className="inline-flex items-center px-4 py-3 text-sm font-semibold text-muted hover:text-ink"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
