import type { Metadata } from "next";
import { RecruiterRegisterForm } from "@/components/recruiter/RecruiterRegisterForm";

export const metadata: Metadata = {
  title: "Recruiter Register",
};

export default function RecruiterRegisterPage() {
  return (
    <div className="mx-auto max-w-md border border-line bg-white p-7 shadow-sm sm:p-9">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal">
        Recruiters
      </p>
      <h1 className="mt-2 text-2xl text-ink">Create account</h1>
      <p className="mt-2 text-sm text-muted">
        Upload your company logo and register. Talent Crafters verifies every
        account before posting is enabled.
      </p>
      <div className="mt-7">
        <RecruiterRegisterForm />
      </div>
    </div>
  );
}
