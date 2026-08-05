"use client";

import Link from "next/link";
import type { InterviewResults } from "@/lib/interview/types";

type InterviewResultsCardProps = {
  firstName: string;
  interviewerName: string;
  position: string;
  results: InterviewResults;
  onRestart: () => void;
};

export function InterviewResultsCard({
  firstName,
  interviewerName,
  position,
  results,
  onRestart,
}: InterviewResultsCardProps) {
  return (
    <div className="space-y-4 px-3 py-4">
      <div className="rounded-xl border border-line bg-paper p-5 text-center shadow-sm">
        <p className="section-label">Your results</p>
        <h2 className="mt-2 text-xl font-bold text-ink">
          Great work, {firstName}!
        </h2>
        <p className="mt-2 text-sm text-muted">
          Practice interview for {position} with {interviewerName}
        </p>
        <div className="mx-auto mt-5 flex h-24 w-24 items-center justify-center rounded-full border-4 border-teal bg-paper-deep">
          <span className="interview-live-serif text-3xl text-teal">
            {results.overallScore}
          </span>
        </div>
        <p className="mt-2 text-xs font-bold uppercase tracking-wide text-muted">
          Overall score
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink">{results.summary}</p>
      </div>

      <div className="rounded-xl border border-line bg-paper p-4 shadow-sm">
        <h3 className="text-sm font-bold text-ink">What you did well</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          {results.strengths.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-teal">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-line bg-paper p-4 shadow-sm">
        <h3 className="text-sm font-bold text-ink">Where to improve</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          {results.improvements.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-teal">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="px-1 text-sm font-bold text-ink">
          Correct way to answer
        </h3>
        {results.corrections.map((correction, index) => (
          <article
            key={`${correction.question}-${index}`}
            className="rounded-xl border border-line bg-paper p-4 shadow-sm"
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-teal">
              Question {index + 1}
            </p>
            <p className="mt-2 text-sm font-semibold text-ink">
              {correction.question}
            </p>
            <div className="mt-3 rounded-lg border border-line bg-paper-deep p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
                Your answer
              </p>
              <p className="mt-1 text-sm text-muted">
                {correction.candidateAnswer}
              </p>
            </div>
            <p className="mt-3 text-xs text-teal">{correction.whatWorked}</p>
            <div className="mt-3 rounded-lg border border-teal/30 bg-teal/10 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-teal">
                Better sample answer
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink">
                {correction.betterAnswer}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-line bg-paper p-4 shadow-sm">
        <h3 className="text-sm font-bold text-ink">Next step</h3>
        <p className="mt-2 text-sm text-muted">{results.closingAdvice}</p>
      </div>

      <div className="flex flex-col gap-3 pb-4">
        <button
          type="button"
          onClick={onRestart}
          className="btn-primary w-full px-6 py-3 text-sm"
        >
          Start new session
        </button>
        <Link
          href="/"
          className="rounded-md border border-line px-6 py-3 text-center text-sm font-semibold text-ink hover:border-teal"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
