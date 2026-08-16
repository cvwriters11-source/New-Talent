"use client";

import { INTERVIEWERS, getInterviewerName } from "@/lib/interview-prep";
import type { InterviewerId } from "@/lib/interview/types";
import type { VoiceStatus } from "@/lib/interview/types";

type SessionPhase =
  | "ready"
  | "greeting"
  | "interviewer_speaking"
  | "waiting_for_answer"
  | "listening"
  | "processing"
  | "ended";

type InterviewLiveStageProps = {
  interviewer: InterviewerId;
  position: string;
  durationMinutes: number;
  phase: SessionPhase;
  voiceStatus: VoiceStatus;
  speakingText: string;
  interimTranscript: string;
  latestQuestion: string;
  error: string;
  remainingLabel: string;
  voiceMode?: "natural" | "browser";
  timerRunning: boolean;
  isLowTime: boolean;
  onStart: () => void;
  onAnswer: () => void;
  onEnd: () => void;
  busy: boolean;
  started: boolean;
};

function statusMessage(
  phase: SessionPhase,
  interviewer: InterviewerId,
  voiceStatus: VoiceStatus,
  timerRunning: boolean,
) {
  const name = getInterviewerName(interviewer);
  if (timerRunning && phase === "ready") return "Interview in progress";
  switch (phase) {
    case "ready":
      return "Ready when you are";
    case "greeting":
    case "interviewer_speaking":
      return voiceStatus === "speaking"
        ? `${name} is speaking`
        : `${name} is preparing`;
    case "waiting_for_answer":
      return "Your turn — tap the mic";
    case "listening":
      return "Listening to you";
    case "processing":
      return `${name} is thinking`;
    case "ended":
      return "Session complete";
    default:
      return "Live interview";
  }
}

function questionText(
  phase: SessionPhase,
  latestQuestion: string,
  speakingText: string,
  started: boolean,
) {
  if (phase === "listening") return latestQuestion || "Waiting for the interviewer…";
  if (speakingText && (phase === "interviewer_speaking" || phase === "greeting")) {
    return speakingText;
  }
  if (latestQuestion) return latestQuestion;
  if (!started) return "Tap start when you are ready to begin.";
  return "Waiting for the interviewer…";
}

export function InterviewLiveStage({
  interviewer,
  position,
  durationMinutes,
  phase,
  voiceStatus,
  speakingText,
  interimTranscript,
  latestQuestion,
  error,
  remainingLabel,
  voiceMode,
  timerRunning,
  isLowTime,
  onStart,
  onAnswer,
  onEnd,
  busy,
  started,
}: InterviewLiveStageProps) {
  const profile = INTERVIEWERS[interviewer];
  const isListening = phase === "listening" || voiceStatus === "listening";
  const isActive = isListening || voiceStatus === "speaking";

  const answerPreview =
    interimTranscript ||
    (isListening ? "" : "Speak clearly — your words will appear here…");

  return (
    <div className="interview-live overflow-hidden rounded-xl bg-gradient-to-b from-paper-deep to-cream text-ink">
      <div className="px-4 pb-5 pt-4">
        {!started ? (
          <div className="mb-5 flex justify-center">
            <button
              type="button"
              onClick={onStart}
              disabled={busy}
              className="btn-primary w-full max-w-[280px] rounded-full py-3.5 text-xs font-bold uppercase tracking-wide disabled:opacity-60"
            >
              {busy ? "Starting…" : "Start interview"}
            </button>
          </div>
        ) : null}

        <p className="text-center text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
          Talent Crafters
        </p>
        <h2 className="interview-live-serif mt-2 text-center text-[1.75rem] leading-none text-ink">
          Live interview
        </h2>
        <p className="mt-2 text-center text-xs leading-relaxed text-muted">
          with {profile.name} · {position} · {durationMinutes} min
          {started && voiceMode === "natural" ? (
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-wide text-teal">
              Natural AI voice
            </span>
          ) : null}
        </p>

        <div className="mt-5 flex justify-center">
          <div
            className={`flex h-[7.5rem] w-[7.5rem] items-center justify-center rounded-full border-[4px] bg-paper shadow-[0_0_24px_rgba(212,175,55,0.2)] ${
              isLowTime
                ? "border-danger"
                : isActive
                  ? "border-teal animate-pulse"
                  : "border-teal/70"
            }`}
          >
            <span
              className={`interview-live-serif text-[2rem] leading-none ${
                isLowTime ? "text-danger" : timerRunning ? "text-teal" : "text-ink"
              }`}
            >
              {remainingLabel}
            </span>
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-muted">
          {statusMessage(phase, interviewer, voiceStatus, timerRunning)}
          {isListening ? <span className="animate-pulse text-teal">…</span> : null}
        </p>

        <div className="mt-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
            Current question
          </p>
          <p className="interview-live-serif mt-2 text-[1.25rem] leading-snug text-ink">
            {questionText(phase, latestQuestion, speakingText, started)}
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-line bg-paper px-3 py-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-teal">
            Your answer (live)
          </p>
          <p
            className={`mt-2 min-h-[3.5rem] text-xs leading-relaxed ${
              interimTranscript ? "text-ink" : "text-muted"
            }`}
          >
            {answerPreview}
          </p>
        </div>

        {error ? (
          <div className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-xs text-danger">
            {error}
          </div>
        ) : null}

        {started && phase === "waiting_for_answer" ? (
          <button
            type="button"
            onClick={onAnswer}
            disabled={busy}
            className="btn-primary mt-4 w-full rounded-full py-3.5 text-xs font-bold uppercase tracking-wide disabled:opacity-60"
          >
            Tap to answer
          </button>
        ) : null}

        {started ? (
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "End this interview session? You can start a new one afterwards.",
                )
              ) {
                onEnd();
              }
            }}
            className="mt-3 w-full rounded-full border border-danger/40 bg-danger/10 py-3 text-xs font-bold uppercase tracking-wide text-danger"
          >
            End interview
          </button>
        ) : null}
      </div>
    </div>
  );
}
