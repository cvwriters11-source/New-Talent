"use client";

import type { FormEvent } from "react";
import type { InterviewSession } from "@/lib/interview/types";
import {
  isExecutiveRole,
  questionsForDuration,
} from "@/lib/interview/executive-questions";

type CandidateDetailsStepProps = {
  value: Pick<
    InterviewSession,
    "firstName" | "surname" | "position" | "phone" | "email"
  >;
  onChange: (
    patch: Partial<
      Pick<
        InterviewSession,
        "firstName" | "surname" | "position" | "phone" | "email"
      >
    >,
  ) => void;
  onSubmit: () => void;
  busy?: boolean;
  error?: string;
};

export function CandidateDetailsStep({
  value,
  onChange,
  onSubmit,
  busy,
  error,
}: CandidateDetailsStepProps) {
  const executive = isExecutiveRole(value.position);
  const executiveQuestionCount = questionsForDuration(30).length;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const phoneDigits = value.phone.replace(/\D/g, "");
    if (phoneDigits.length < 9) {
      return;
    }
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-semibold text-ink">Name</span>
          <input
            required
            className="min-h-11 w-full border border-line bg-paper-deep px-3 py-2 text-sm outline-none focus:border-teal"
            value={value.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            placeholder="e.g. Thandi"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-semibold text-ink">Surname</span>
          <input
            required
            className="min-h-11 w-full border border-line bg-paper-deep px-3 py-2 text-sm outline-none focus:border-teal"
            value={value.surname}
            onChange={(e) => onChange({ surname: e.target.value })}
            placeholder="e.g. Nkosi"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block font-semibold text-ink">
            Position you want to prepare for
          </span>
          <input
            required
            className="min-h-11 w-full border border-line bg-paper-deep px-3 py-2 text-sm outline-none focus:border-teal"
            value={value.position}
            onChange={(e) => onChange({ position: e.target.value })}
            placeholder="e.g. Finance Director or Customer Service Representative"
          />
          {executive ? (
            <p className="mt-2 rounded-lg border border-teal/30 bg-teal/5 px-3 py-2 text-xs leading-relaxed text-ink">
              Executive mode: your session will use our senior leadership question
              bank (up to {executiveQuestionCount} questions in a 30-minute session)
              with STAR coaching and sample answer feedback.
            </p>
          ) : null}
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-semibold text-ink">Phone number</span>
          <input
            required
            type="tel"
            minLength={9}
            className="min-h-11 w-full border border-line bg-paper-deep px-3 py-2 text-sm outline-none focus:border-teal"
            value={value.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="e.g. 082 123 4567"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-semibold text-ink">Email</span>
          <input
            required
            type="email"
            className="min-h-11 w-full border border-line bg-paper-deep px-3 py-2 text-sm outline-none focus:border-teal"
            value={value.email}
            onChange={(e) => onChange({ email: e.target.value.trim() })}
            placeholder="you@email.com"
          />
        </label>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {!error && value.phone && value.phone.replace(/\D/g, "").length < 9 ? (
        <p className="text-sm text-muted">Enter a valid phone number.</p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="btn-primary w-full px-6 py-3 text-sm disabled:opacity-60 sm:w-auto"
      >
        {busy ? "Saving…" : "Next"}
      </button>
    </form>
  );
}
