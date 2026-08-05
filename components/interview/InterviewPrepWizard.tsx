"use client";

import Link from "next/link";
import { useState } from "react";
import { VoiceInterviewRoom } from "@/components/interview/VoiceInterviewRoom";
import { CandidateDetailsStep } from "@/components/interview/steps/CandidateDetailsStep";
import { DurationStep } from "@/components/interview/steps/DurationStep";
import { InterviewerStep } from "@/components/interview/steps/InterviewerStep";
import type { InterviewSession } from "@/lib/interview/types";

type WizardStep = "details" | "interviewer" | "duration" | "session";

const STEP_LABELS: Record<WizardStep, string> = {
  details: "Your details",
  interviewer: "Choose interviewer",
  duration: "Session length",
  session: "Voice interview",
};

const STEP_ORDER: WizardStep[] = [
  "details",
  "interviewer",
  "duration",
  "session",
];

const initialSession = (): InterviewSession => ({
  firstName: "",
  surname: "",
  position: "",
  phone: "",
  email: "",
  interviewer: "lisa",
  durationMinutes: 30,
});

export function InterviewPrepWizard() {
  const [step, setStep] = useState<WizardStep>("details");
  const [session, setSession] = useState<InterviewSession>(initialSession);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const stepIndex = STEP_ORDER.indexOf(step);

  function updateSession(patch: Partial<InterviewSession>) {
    setSession((prev) => ({ ...prev, ...patch }));
  }

  async function saveDetailsAndContinue() {
    const phoneDigits = session.phone.replace(/\D/g, "");
    if (phoneDigits.length < 9) {
      setError("Please enter a valid phone number.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/interview-prep/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: session.firstName.trim(),
          surname: session.surname.trim(),
          position: session.position.trim(),
          phone: session.phone.trim(),
          email: session.email.trim(),
        }),
      });
      const json = (await res.json()) as {
        sessionId?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error || "Could not save your details.");
      }
      if (!json.sessionId) {
        throw new Error("Could not create your interview session.");
      }
      updateSession({
        sessionId: json.sessionId,
        firstName: session.firstName.trim(),
        surname: session.surname.trim(),
        position: session.position.trim(),
        phone: session.phone.trim(),
        email: session.email.trim(),
      });
      setStep("interviewer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function saveInterviewerAndContinue() {
    setError("");
    if (session.sessionId) {
      await fetch("/api/interview-prep/register", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.sessionId,
          interviewer: session.interviewer,
        }),
      });
    }
    setStep("duration");
  }

  async function startSession() {
    setBusy(true);
    setError("");
    if (session.sessionId) {
      await fetch("/api/interview-prep/register", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.sessionId,
          durationMinutes: session.durationMinutes,
        }),
      });
    }
    setBusy(false);
    setStep("session");
  }

  function restartWizard() {
    setSession(initialSession());
    setStep("details");
    setError("");
  }

  const isSession = step === "session";

  return (
    <div
      className={`mx-auto w-full ${
        isSession
          ? "mx-auto max-w-[430px] px-0 py-0"
          : "min-h-[calc(100svh-4rem)] max-w-3xl px-4 py-6 sm:px-6"
      }`}
    >
      {!isSession ? (
        <>
          <Link
            href="/"
            className="text-sm font-semibold text-teal underline underline-offset-2"
          >
            ← Back to home
          </Link>

          <div className="mt-4">
            <p className="section-label">AI interview preparation</p>
            <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
              Prepare your upcoming interview
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              Complete the steps below, then practise with a live voice mock
              interview.
            </p>
          </div>

          <div className="mt-6 flex gap-2">
            {STEP_ORDER.slice(0, 3).map((item, index) => {
              const active = step === item;
              const done = stepIndex > index;
              return (
                <div
                  key={item}
                  className="flex min-w-0 flex-1 items-center gap-2"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      active || done
                        ? "bg-teal text-white"
                        : "bg-paper-deep text-muted"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p
                    className={`hidden truncate text-xs font-semibold sm:block ${
                      active ? "text-ink" : "text-muted"
                    }`}
                  >
                    {STEP_LABELS[item]}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      <section
        className={
          isSession
            ? "min-h-[calc(100svh-4rem)] overflow-hidden border-x border-line bg-cream shadow-[0_0_40px_rgba(0,163,255,0.08)] sm:mx-auto sm:rounded-2xl sm:border"
            : "mt-6 rounded-xl border border-line bg-paper p-4 shadow-sm sm:p-6"
        }
      >
        {!isSession ? (
          <h2 className="text-lg font-bold text-ink">{STEP_LABELS[step]}</h2>
        ) : null}

        <div className={isSession ? "" : "mt-5"}>
          {step === "details" ? (
            <CandidateDetailsStep
              value={session}
              onChange={updateSession}
              onSubmit={() => void saveDetailsAndContinue()}
              busy={busy}
              error={error}
            />
          ) : null}

          {step === "interviewer" ? (
            <InterviewerStep
              value={session.interviewer}
              onChange={(interviewer) => updateSession({ interviewer })}
              onBack={() => setStep("details")}
              onNext={() => void saveInterviewerAndContinue()}
            />
          ) : null}

          {step === "duration" ? (
            <DurationStep
              value={session.durationMinutes}
              onChange={(durationMinutes) => updateSession({ durationMinutes })}
              onBack={() => setStep("interviewer")}
              onStart={() => void startSession()}
              busy={busy}
            />
          ) : null}

          {step === "session" ? (
            <VoiceInterviewRoom
              key={session.sessionId || "session"}
              session={session}
              onEnd={restartWizard}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
