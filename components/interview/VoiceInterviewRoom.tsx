"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { InterviewLiveStage } from "@/components/interview/InterviewLiveStage";
import { InterviewResultsCard } from "@/components/interview/InterviewResultsCard";
import { InterviewTimerBar } from "@/components/interview/InterviewTimerBar";
import { useInterviewRecorder } from "@/hooks/useInterviewRecorder";
import {
  isMicSupported,
  isVoiceSupported,
  useVoiceInterview,
} from "@/hooks/useVoiceInterview";
import { getGreetingScript, getInterviewerName } from "@/lib/interview-prep";
import type {
  InterviewApiContext,
  InterviewPhase,
  InterviewResults,
  InterviewSession,
} from "@/lib/interview/types";

type TranscriptLine = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

type SessionPhase =
  | "ready"
  | "greeting"
  | "interviewer_speaking"
  | "waiting_for_answer"
  | "listening"
  | "processing"
  | "ended";

type VoiceInterviewRoomProps = {
  session: InterviewSession;
  onEnd: () => void;
};

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function capitalize(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return value;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

async function patchSession(
  sessionId: string | undefined,
  patch: Record<string, unknown>,
) {
  if (!sessionId || sessionId.startsWith("local_")) return;
  try {
    await fetch("/api/interview-prep/register", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, ...patch }),
    });
  } catch {
    /* non-blocking */
  }
}

export function VoiceInterviewRoom({ session, onEnd }: VoiceInterviewRoomProps) {
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<SessionPhase>("ready");
  const totalSeconds = session.durationMinutes * 60;
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [busy, setBusy] = useState(false);
  const [latestQuestion, setLatestQuestion] = useState("");
  const [timerRunning, setTimerRunning] = useState(false);
  const [results, setResults] = useState<InterviewResults | null>(null);
  const [resultsBusy, setResultsBusy] = useState(false);
  const messagesRef = useRef<{ role: "user" | "assistant"; content: string }[]>(
    [],
  );
  const linesRef = useRef<TranscriptLine[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const remainingRef = useRef(totalSeconds);
  const endedRef = useRef(false);
  const answeringRef = useRef(false);
  const finishingRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const voiceSupported = isVoiceSupported();
  const micSupported = isMicSupported();
  const started = phase !== "ready" && phase !== "ended";
  const interviewerName = getInterviewerName(session.interviewer);
  const displayName = capitalize(session.firstName);

  const {
    startCandidateRecording,
    stopCandidateRecording,
    addAssistantAudio,
    uploadAll,
    clear: clearRecorder,
  } = useInterviewRecorder(session.sessionId);

  const addLine = useCallback(
    (role: TranscriptLine["role"], content: string) => {
      setLines((prev) => {
        const next = [
          ...prev,
          { id: `${role}-${crypto.randomUUID()}`, role, content },
        ];
        linesRef.current = next;
        return next;
      });
    },
    [],
  );

  const {
    status,
    interimTranscript,
    speakingText,
    voiceMode,
    speak,
    listen,
    cancelSpeech,
    setStatus,
  } = useVoiceInterview({
    interviewer: session.interviewer,
    onError: (message) => setError(message),
    onAssistantAudio: addAssistantAudio,
  });

  function liveStatusLabel() {
    if (phase === "listening" || status === "listening") return "Listening to you";
    if (phase === "processing" || status === "processing") {
      return `${interviewerName} is thinking`;
    }
    if (
      status === "speaking" ||
      phase === "interviewer_speaking" ||
      phase === "greeting"
    ) {
      return `${interviewerName} is speaking`;
    }
    if (phase === "waiting_for_answer") return "Your turn — tap to answer";
    return "Interview in progress";
  }

  const resetToReady = useCallback(() => {
    setTimerRunning(false);
    remainingRef.current = totalSeconds;
    setRemainingSeconds(totalSeconds);
    startedAtRef.current = null;
    endedRef.current = false;
    answeringRef.current = false;
    finishingRef.current = false;
    setPhase("ready");
    setBusy(false);
    setResults(null);
    setResultsBusy(false);
    setStatus("idle");
  }, [setStatus, totalSeconds]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, interimTranscript, phase, speakingText]);

  useEffect(() => {
    if (!timerRunning || endedRef.current) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = Math.max(0, prev - 1);
        remainingRef.current = next;
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning]);

  const getApiContext = useCallback(
    (apiPhase: InterviewPhase): InterviewApiContext => {
      const elapsedMinutes = startedAtRef.current
        ? Math.floor((Date.now() - startedAtRef.current) / 60000)
        : 0;
      return {
        firstName: session.firstName,
        surname: session.surname,
        position: session.position,
        phone: session.phone,
        email: session.email,
        interviewer: session.interviewer,
        durationMinutes: session.durationMinutes,
        phase: apiPhase,
        elapsedMinutes,
        sessionId: session.sessionId,
      };
    },
    [session],
  );

  const finishSession = useCallback(async () => {
    if (endedRef.current || finishingRef.current) return;
    endedRef.current = true;
    finishingRef.current = true;
    answeringRef.current = false;
    setTimerRunning(false);
    cancelSpeech();
    setPhase("ended");
    setResultsBusy(true);
    setError("");

    try {
      await stopCandidateRecording();
      const audioClips = await uploadAll();
      const res = await fetch("/api/interview-prep/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.sessionId,
          context: getApiContext("wrapup"),
          transcript: linesRef.current,
          audioClips,
        }),
      });
      const json = (await res.json()) as {
        results?: InterviewResults;
        error?: string;
      };
      if (!res.ok || !json.results) {
        throw new Error(json.error || "Could not generate your results.");
      }
      setResults(json.results);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Results are temporarily unavailable.",
      );
      void patchSession(session.sessionId, { status: "completed" });
    } finally {
      clearRecorder();
      setResultsBusy(false);
      finishingRef.current = false;
    }
  }, [
    cancelSpeech,
    clearRecorder,
    getApiContext,
    session.sessionId,
    stopCandidateRecording,
    uploadAll,
  ]);

  useEffect(() => {
    if (remainingSeconds === 0 && timerRunning && !endedRef.current) {
      void finishSession();
    }
  }, [finishSession, remainingSeconds, timerRunning]);

  const askAi = useCallback(
    async (userMessage: string, apiPhase: InterviewPhase) => {
      const nextMessages = [
        ...messagesRef.current,
        { role: "user" as const, content: userMessage },
      ];
      messagesRef.current = nextMessages;

      const res = await fetch("/api/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          context: getApiContext(apiPhase),
        }),
      });
      const json = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !json.reply) {
        throw new Error(json.error || "Interview coach unavailable.");
      }

      messagesRef.current = [
        ...nextMessages,
        { role: "assistant", content: json.reply },
      ];
      return json.reply;
    },
    [getApiContext],
  );

  const speakAsInterviewer = useCallback(
    async (text: string) => {
      setLatestQuestion(text);
      setPhase("interviewer_speaking");
      await speak(text);
    },
    [speak],
  );

  const startInterview = useCallback(async () => {
    if (!micSupported) {
      setError(
        "Voice interviews need Chrome or Edge with microphone access.",
      );
      return;
    }
    if (busy || started) return;

    setBusy(true);
    setError("");
    endedRef.current = false;
    answeringRef.current = false;
    finishingRef.current = false;
    remainingRef.current = totalSeconds;
    setRemainingSeconds(totalSeconds);
    messagesRef.current = [];
    linesRef.current = [];
    setLines([]);
    setLatestQuestion("");
    setResults(null);
    clearRecorder();

    void patchSession(session.sessionId, {
      status: "in_progress",
      interviewer: session.interviewer,
      durationMinutes: session.durationMinutes,
    });

    const greeting = getGreetingScript(session);
    addLine("system", greeting);
    setPhase("greeting");

    try {
      await speak(greeting);
      if (endedRef.current) return;

      startedAtRef.current = Date.now();
      setTimerRunning(true);
      setPhase("processing");
      setStatus("processing");

      const firstQuestion = await askAi(
        "[START INTERVIEW] I am ready.",
        "greeting",
      );
      if (endedRef.current) return;

      addLine("assistant", firstQuestion);
      await speakAsInterviewer(firstQuestion);
      if (endedRef.current) return;

      setPhase("waiting_for_answer");
    } catch (err) {
      cancelSpeech();
      resetToReady();
      setError(
        err instanceof Error ? err.message : "Could not start interview.",
      );
    } finally {
      setBusy(false);
    }
  }, [
    addLine,
    askAi,
    busy,
    cancelSpeech,
    clearRecorder,
    micSupported,
    resetToReady,
    session,
    setStatus,
    speak,
    speakAsInterviewer,
    started,
    totalSeconds,
  ]);

  const handleAnswer = useCallback(async () => {
    if (
      endedRef.current ||
      remainingRef.current <= 0 ||
      answeringRef.current ||
      phase !== "waiting_for_answer"
    ) {
      return;
    }

    answeringRef.current = true;
    setError("");
    setBusy(true);
    setPhase("listening");
    void startCandidateRecording();

    try {
      const answer = await listen();
      if (endedRef.current) return;

      await stopCandidateRecording(answer);
      addLine("user", answer);

      const apiPhase: InterviewPhase =
        remainingRef.current <= 120 ? "wrapup" : "interview";

      setPhase("processing");
      setStatus("processing");
      const reply = await askAi(answer, apiPhase);
      if (endedRef.current) return;

      addLine("assistant", reply);
      await speakAsInterviewer(reply);
      if (endedRef.current) return;

      if (apiPhase === "wrapup" || remainingRef.current <= 0) {
        void finishSession();
        return;
      }

      setPhase("waiting_for_answer");
    } catch (err) {
      if (endedRef.current) return;
      await stopCandidateRecording();
      const message =
        err instanceof Error ? err.message : "Could not hear your answer.";
      if (!message.toLowerCase().includes("cancelled")) {
        setError(`${message} Tap to answer and try again.`);
      }
      setPhase("waiting_for_answer");
    } finally {
      answeringRef.current = false;
      setBusy(false);
      setStatus("idle");
    }
  }, [
    addLine,
    askAi,
    finishSession,
    listen,
    phase,
    setStatus,
    speakAsInterviewer,
    startCandidateRecording,
    stopCandidateRecording,
  ]);

  if (phase === "ended") {
    if (resultsBusy || !results) {
      return (
        <div className="space-y-4 px-3 py-8 text-center">
          <p className="section-label">Preparing your results</p>
          <h2 className="mt-2 text-xl font-bold text-ink">
            Scoring your interview…
          </h2>
          <p className="mt-3 text-sm text-muted">
            We are reviewing your answers and building corrected sample responses.
          </p>
          {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        </div>
      );
    }

    return (
      <InterviewResultsCard
        firstName={displayName}
        interviewerName={interviewerName}
        position={session.position}
        results={results}
        onRestart={onEnd}
      />
    );
  }

  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col bg-cream">
      {timerRunning ? (
        <InterviewTimerBar
          remainingLabel={formatTime(remainingSeconds)}
          interviewerName={interviewerName}
          statusLabel={liveStatusLabel()}
          isLowTime={remainingSeconds <= 120}
        />
      ) : null}

      <div className="flex-1 space-y-3 px-3 pb-4 pt-1">
        <InterviewLiveStage
          interviewer={session.interviewer}
          position={session.position}
          durationMinutes={session.durationMinutes}
          phase={phase}
          voiceStatus={status}
          speakingText={speakingText}
          interimTranscript={interimTranscript}
          latestQuestion={latestQuestion}
          error={error}
          remainingLabel={formatTime(remainingSeconds)}
          voiceMode={voiceMode}
          timerRunning={timerRunning}
          isLowTime={remainingSeconds <= 120}
          onStart={() => void startInterview()}
          onAnswer={() => void handleAnswer()}
          onEnd={() => void finishSession()}
          busy={busy}
          started={started}
        />

        <div className="overflow-hidden rounded-xl border border-line bg-paper shadow-sm">
          <div className="border-b border-line px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal">
              Live transcript
            </p>
          </div>
          <div className="max-h-[32vh] min-h-[8rem] space-y-2.5 overflow-y-auto bg-paper-deep/40 px-3 py-3">
            {lines.length === 0 ? (
              <p className="text-xs text-muted">
                Your conversation with {interviewerName} will show here once the
                interview starts.
              </p>
            ) : (
              lines.map((line) => (
                <div
                  key={line.id}
                  className={
                    line.role === "user"
                      ? "ml-auto max-w-[92%] rounded-lg bg-teal/20 px-3 py-2 text-xs text-ink"
                      : line.role === "system"
                        ? "mx-auto max-w-[95%] rounded-lg border border-dashed border-line px-3 py-2 text-center text-xs text-muted"
                        : "mr-auto max-w-[92%] rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink"
                  }
                >
                  {line.role === "assistant" ? (
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-teal">
                      {interviewerName}
                    </p>
                  ) : line.role === "user" ? (
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted">
                      You
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap">{line.content}</p>
                </div>
              ))
            )}
            {phase === "listening" && interimTranscript ? (
              <div className="ml-auto max-w-[92%] rounded-lg border border-teal/30 bg-teal/10 px-3 py-2 text-xs text-ink">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-teal">
                  You (speaking…)
                </p>
                <p className="italic">{interimTranscript}</p>
              </div>
            ) : null}
            {(phase === "interviewer_speaking" || phase === "greeting") &&
            speakingText ? (
              <div className="mr-auto max-w-[92%] rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-teal">
                  {interviewerName} (speaking…)
                </p>
                <p className="italic">{speakingText}</p>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
        </div>

        {!voiceSupported || !micSupported ? (
          <p className="px-1 text-xs text-muted">
            Voice requires Chrome or Edge and microphone permission.
          </p>
        ) : null}
      </div>
    </div>
  );
}
