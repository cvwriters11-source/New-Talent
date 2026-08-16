"use client";

import { DURATION_OPTIONS } from "@/lib/interview-prep";
import {
  isExecutiveRole,
  questionsForDuration,
} from "@/lib/interview/executive-questions";
import type { InterviewDuration } from "@/lib/interview/types";

type DurationStepProps = {
  value: InterviewDuration;
  position?: string;
  onChange: (value: InterviewDuration) => void;
  onStart: () => void;
  onBack: () => void;
  busy?: boolean;
};

export function DurationStep({
  value,
  position = "",
  onChange,
  onStart,
  onBack,
  busy,
}: DurationStepProps) {
  const executive = isExecutiveRole(position);
  const questionCount = questionsForDuration(value).length;

  return (
    <div className="space-y-5">
      {executive ? (
        <p className="rounded-lg border border-teal/30 bg-teal/5 px-4 py-3 text-sm leading-relaxed text-ink">
          Executive interview prep includes {questionCount} leadership questions
          for this session length, plus coaching on business impact and measurable
          results.
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        {DURATION_OPTIONS.map((option) => {
          const selected = value === option.minutes;
          return (
            <button
              key={option.minutes}
              type="button"
              onClick={() => onChange(option.minutes)}
              className={`rounded-xl border p-5 text-left transition ${
                selected
                  ? "border-teal bg-teal/10 shadow-sm"
                  : "border-line bg-paper hover:border-teal/50"
              }`}
            >
              <p className="text-xl font-bold text-ink">{option.label}</p>
              <p className="mt-2 text-sm text-muted">{option.description}</p>
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
          onClick={onStart}
          disabled={busy}
          className="btn-primary px-6 py-3 text-sm disabled:opacity-60"
        >
          {busy ? "Starting…" : "Start interview"}
        </button>
      </div>
    </div>
  );
}
