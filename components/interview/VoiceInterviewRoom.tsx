"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { InterviewQuestion } from "@/lib/interview/question-bank";
import type { InterviewSession, InterviewTurn } from "@/lib/interview/store";

type RoomProps = {
  sessionId: string;
  initialSession: InterviewSession;
  initialQuestions: InterviewQuestion[];
};

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VoiceInterviewRoom({
  sessionId,
  initialSession,
  initialQuestions,
}: RoomProps) {
  const router = useRouter();
  const [session, setSession] = useState(initialSession);
  const [questions] = useState(initialQuestions);
  const [turn, setTurn] = useState<InterviewTurn | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [phase, setPhase] = useState<
    "loading" | "listening" | "recording" | "processing" | "review" | "done"
  >("loading");
  const [error, setError] = useState<string | null>(null);
  const [textMode, setTextMode] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(
    initialSession.durationMinutes * 60,
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const finishingRef = useRef(false);

  const finishSession = useCallback(
    async (abandoned = false) => {
      if (finishingRef.current) return;
      finishingRef.current = true;
      setPhase("done");
      try {
        await fetch("/api/interview/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, abandoned }),
        });
      } catch {
        /* still navigate */
      }
      router.push(`/interview/session/${sessionId}/results`);
    },
    [router, sessionId],
  );

  const speakQuestion = useCallback(async (text: string) => {
    try {
      const res = await fetch("/api/interview/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      await audio.play().catch(() => undefined);
    } catch {
      /* TTS optional */
    }
  }, []);

  const askNext = useCallback(async () => {
    setError(null);
    setFeedback(null);
    setScore(null);
    setTranscript("");
    setPhase("loading");
    try {
      const res = await fetch("/api/interview/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, action: "ask" }),
      });
      const json = (await res.json()) as {
        error?: string;
        done?: boolean;
        turn?: InterviewTurn;
        question?: InterviewQuestion;
        index?: number;
        session?: InterviewSession;
      };
      if (json.done || (!res.ok && json.done)) {
        await finishSession(false);
        return;
      }
      if (!res.ok || !json.turn || !json.question) {
        throw new Error(json.error || "Could not load question.");
      }
      setTurn(json.turn);
      setQuestionIndex(json.index ?? 0);
      if (json.session) setSession(json.session);
      setPhase("listening");
      await speakQuestion(
        `Question ${(json.index ?? 0) + 1}. ${json.question.prompt}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ask question.");
      setPhase("listening");
    }
  }, [finishSession, sessionId, speakQuestion]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/interview/turn?sessionId=${sessionId}`);
        const json = (await res.json()) as {
          turns?: InterviewTurn[];
          session?: InterviewSession;
        };
        if (json.session) setSession(json.session);
        const existing = json.turns ?? [];
        const open = existing.find((t) => !t.answerTranscript);
        if (open) {
          setTurn(open);
          setQuestionIndex(open.sortOrder);
          setPhase("listening");
          await speakQuestion(
            `Question ${open.sortOrder + 1}. ${open.questionText}`,
          );
          return;
        }
        if (
          existing.length >= questions.length &&
          existing.every((t) => t.answerTranscript)
        ) {
          await finishSession(false);
          return;
        }
        await askNext();
      } catch {
        await askNext();
      }
    })();
    return () => {
      audioRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start once
  }, []);

  useEffect(() => {
    if (phase === "done") return;
    const started = session.startedAt
      ? new Date(session.startedAt).getTime()
      : Date.now();
    const endAt = started + session.durationMinutes * 60 * 1000;

    const tick = () => {
      const left = Math.max(0, Math.floor((endAt - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) {
        void finishSession(true);
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [finishSession, phase, session.durationMinutes, session.startedAt]);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        void processRecording();
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setPhase("recording");
    } catch {
      setTextMode(true);
      setError("Microphone unavailable — type your answer instead.");
      setPhase("listening");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setPhase("processing");
  }

  async function processRecording() {
    setPhase("processing");
    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const form = new FormData();
      form.append("audio", blob, "answer.webm");
      const res = await fetch("/api/interview/transcribe", {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as {
        error?: string;
        transcript?: string;
        audioUrl?: string | null;
      };
      if (!res.ok) {
        setTextMode(true);
        throw new Error(json.error || "Transcription failed.");
      }
      setTranscript(json.transcript || "");
      await submitAnswer(json.transcript || "", json.audioUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not process audio.");
      setPhase("listening");
    }
  }

  async function submitAnswer(answer: string, audioUrl?: string | null) {
    if (!turn) return;
    setPhase("processing");
    setError(null);
    try {
      const res = await fetch("/api/interview/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          action: "answer",
          turnId: turn.id,
          answerTranscript: answer,
          audioUrl,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        score?: { score: number; feedback: string };
        remaining?: number;
      };
      if (!res.ok) throw new Error(json.error || "Could not save answer.");
      setScore(json.score?.score ?? null);
      setFeedback(json.score?.feedback ?? null);
      setPhase("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed.");
      setPhase("listening");
    }
  }

  async function onTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitAnswer(transcript);
  }

  const currentPrompt =
    turn?.questionText || questions[questionIndex]?.prompt || "…";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-teal">
            Free voice practice
          </p>
          <h1 className="text-2xl font-bold text-ink">Interview in progress</h1>
        </div>
        <div
          className={`rounded-full px-4 py-2 font-mono text-lg font-bold ${
            secondsLeft < 60 ? "bg-danger/10 text-danger" : "bg-ink text-white"
          }`}
        >
          {formatTime(secondsLeft)}
        </div>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-line">
        <div
          className="h-full bg-teal transition-all"
          style={{
            width: `${Math.min(100, ((questionIndex + (phase === "review" ? 1 : 0)) / questions.length) * 100)}%`,
          }}
        />
      </div>
      <p className="mb-6 text-sm text-muted">
        Question {Math.min(questionIndex + 1, questions.length)} of{" "}
        {questions.length}
      </p>

      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Interviewer asks
        </p>
        <p className="text-xl font-bold leading-snug text-ink">{currentPrompt}</p>

        {phase === "loading" && (
          <p className="mt-6 text-sm text-muted">Preparing next question…</p>
        )}

        {phase === "listening" && !textMode && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => void startRecording()}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-teal text-white shadow-lg transition hover:scale-105"
              aria-label="Start recording answer"
            >
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zm5-3a5 5 0 01-10 0H5a7 7 0 0014 0h-2zm-5 9a1 1 0 01-1-1v-2h2v2a1 1 0 01-1 1z" />
              </svg>
            </button>
            <p className="text-sm text-muted">Tap to speak your answer</p>
            <button
              type="button"
              className="text-sm font-semibold text-ink underline"
              onClick={() => setTextMode(true)}
            >
              Type instead
            </button>
          </div>
        )}

        {phase === "recording" && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={stopRecording}
              className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-danger text-white"
              aria-label="Stop recording"
            >
              <span className="h-6 w-6 rounded-sm bg-white" />
            </button>
            <p className="text-sm font-semibold text-danger">Recording… tap to stop</p>
          </div>
        )}

        {phase === "processing" && (
          <p className="mt-6 text-sm text-muted">Scoring your answer…</p>
        )}

        {(textMode || phase === "review") && phase !== "processing" && phase !== "done" && (
          <form onSubmit={onTextSubmit} className="mt-6 space-y-3">
            <label className="block text-sm">
              <span className="mb-1.5 block font-semibold text-ink">
                Your answer
              </span>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={5}
                disabled={phase === "review"}
                className="w-full rounded-lg border border-line px-3 py-2.5 outline-none focus:border-ink disabled:bg-paper-deep"
                placeholder="Speak or type your answer here…"
              />
            </label>
            {phase !== "review" && (
              <button type="submit" className="btn-primary">
                Submit answer
              </button>
            )}
          </form>
        )}

        {phase === "review" && (
          <div className="mt-6 space-y-4 rounded-xl bg-paper-deep p-4">
            {score !== null && (
              <p className="text-lg font-bold text-ink">
                Score: {score}/10
              </p>
            )}
            {feedback && <p className="text-sm text-muted">{feedback}</p>}
            <div className="flex flex-wrap gap-2">
              {questionIndex + 1 < questions.length ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => void askNext()}
                >
                  Next question
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => void finishSession(false)}
                >
                  See final results
                </button>
              )}
              <button
                type="button"
                className="rounded-lg border border-line px-4 py-2 text-sm font-semibold"
                onClick={() => void finishSession(true)}
              >
                End early
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
