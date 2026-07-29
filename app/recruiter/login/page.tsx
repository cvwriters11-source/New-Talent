import type { Metadata } from "next";
import { Suspense } from "react";
import { RecruiterLoginForm } from "@/components/recruiter/RecruiterLoginForm";

export const metadata: Metadata = {
  title: "Recruiter Login",
};

export default function RecruiterLoginPage() {
  return (
    <div className="mx-auto max-w-md border border-line bg-white p-7 shadow-sm sm:p-9">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal">
        Recruiters
      </p>
      <h1 className="mt-2 text-2xl text-ink">Sign in</h1>
      <p className="mt-2 text-sm text-muted">
        Post roles and track approval status from your dashboard.
      </p>
      <div className="mt-7">
        <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
          <RecruiterLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
