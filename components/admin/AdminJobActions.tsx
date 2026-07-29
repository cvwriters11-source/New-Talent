"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { JobStatus } from "@/lib/recruiter/store";

type Props = {
  jobId: string;
  currentStatus: JobStatus;
};

export function AdminJobActions({ jobId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function setStatus(status: JobStatus) {
    setLoading(status);
    setError("");
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Update failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-2">
        {currentStatus !== "published" ? (
          <button
            type="button"
            disabled={!!loading}
            onClick={() => setStatus("published")}
            className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
          >
            {loading === "published" ? "…" : "Approve"}
          </button>
        ) : null}
        {currentStatus !== "rejected" ? (
          <button
            type="button"
            disabled={!!loading}
            onClick={() => setStatus("rejected")}
            className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
          >
            {loading === "rejected" ? "…" : "Reject"}
          </button>
        ) : null}
        {currentStatus !== "closed" ? (
          <button
            type="button"
            disabled={!!loading}
            onClick={() => setStatus("closed")}
            className="rounded-md bg-slate-600 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
          >
            {loading === "closed" ? "…" : "Close"}
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
