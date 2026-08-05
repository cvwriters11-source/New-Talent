"use client";

import { INTERVIEWERS } from "@/lib/interview-prep";
import type { InterviewerId } from "@/lib/interview/types";

type InterviewerStepProps = {
  value: InterviewerId;
  onChange: (value: InterviewerId) => void;
  onNext: () => void;
  onBack: () => void;
};

const OPTIONS: InterviewerId[] = ["lisa", "clemence"];

export function InterviewerStep({
  value,
  onChange,
  onNext,
  onBack,
}: InterviewerStepProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {OPTIONS.map((id) => {
          const interviewer = INTERVIEWERS[id];
          const selected = value === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`rounded-xl border p-5 text-left transition ${
                selected
                  ? "border-teal bg-teal/10 shadow-sm"
                  : "border-line bg-paper hover:border-teal/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${
                    selected ? "bg-teal text-white" : "bg-paper-deep text-ink"
                  }`}
                >
                  {interviewer.name[0]}
                </div>
                <div>
                  <p className="font-bold text-ink">{interviewer.name}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal">
                    {interviewer.voiceLabel}
                  </p>
                  <p className="text-[11px] text-muted">{interviewer.title}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {interviewer.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-line px-5 py-3 text-sm font-semibold text-ink hover:border-teal"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="btn-primary px-6 py-3 text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}
