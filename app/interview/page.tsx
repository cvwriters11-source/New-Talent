import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InterviewAuthForms } from "@/components/interview/InterviewAuthForms";
import { getCandidateSession } from "@/lib/interview/auth";
import { interviewTips } from "@/lib/interview/question-bank";

export const metadata: Metadata = {
  title: "AI Interview Prep",
  description:
    "Free voice interview practice with Talent Crafters — 15, 30, or 60 minutes with scored feedback.",
};

export default async function InterviewLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; mode?: string }>;
}) {
  const session = await getCandidateSession();
  const params = await searchParams;
  if (session) {
    redirect(params.next || "/interview/dashboard");
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#c8102e14,_transparent_55%)]" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-start lg:gap-16 lg:px-8 lg:py-16">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal">
            Free practice · Voice AI
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
            Prepare for interviews with confidence
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted sm:text-lg">
            Register, choose 15, 30, or 60 minutes, and practise common interview
            questions aloud. Get a score and clear coaching on what to fix.
          </p>
          <ul className="mt-8 space-y-2 text-sm text-ink/80">
            {interviewTips.slice(0, 5).map((tip) => (
              <li key={tip} className="flex gap-2">
                <span className="text-teal">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <InterviewAuthForms
          initialMode={params.mode === "login" ? "login" : "register"}
          nextPath={params.next || "/interview/dashboard"}
        />
      </div>
    </div>
  );
}
