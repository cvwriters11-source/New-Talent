import { NextResponse } from "next/server";
import { getCandidateSession } from "@/lib/interview/auth";
import {
  pickQuestionsForDuration,
  type InterviewDuration,
} from "@/lib/interview/question-bank";
import { scoreInterviewAnswer } from "@/lib/interview/score";
import {
  createTurn,
  getQuestionSample,
  getSession,
  getTurnsForSession,
  startSession,
  updateTurnAnswer,
} from "@/lib/interview/store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const auth = await getCandidateSession();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const session = await getSession(sessionId);
  if (!session || session.candidateId !== auth.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const turns = await getTurnsForSession(sessionId);
  const questions = pickQuestionsForDuration(
    session.durationMinutes as InterviewDuration,
  );

  return NextResponse.json({ session, turns, questions });
}

/** Ask next question (create turn) or submit an answer for the current turn. */
export async function POST(request: Request) {
  const auth = await getCandidateSession();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    sessionId?: string;
    action?: "ask" | "answer";
    turnId?: string;
    answerTranscript?: string;
    audioUrl?: string | null;
  };

  const sessionId = body.sessionId;
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  let session = await getSession(sessionId);
  if (!session || session.candidateId !== auth.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.status === "completed" || session.status === "abandoned") {
    return NextResponse.json(
      { error: "This session is already finished." },
      { status: 400 },
    );
  }

  if (session.status === "pending") {
    session = (await startSession(sessionId)) ?? session;
  }

  const questions = pickQuestionsForDuration(
    session.durationMinutes as InterviewDuration,
  );
  const turns = await getTurnsForSession(sessionId);

  if (body.action === "ask") {
    if (turns.length >= questions.length) {
      return NextResponse.json(
        { error: "No more questions.", done: true, turns },
        { status: 400 },
      );
    }
    const next = questions[turns.length];
    const turn = await createTurn({
      sessionId,
      questionSlug: next.slug,
      questionText: next.prompt,
      sortOrder: turns.length,
    });
    return NextResponse.json({
      turn,
      question: next,
      index: turns.length,
      total: questions.length,
      session,
    });
  }

  if (body.action === "answer") {
    if (!body.turnId) {
      return NextResponse.json({ error: "turnId required" }, { status: 400 });
    }
    const turn = turns.find((t) => t.id === body.turnId);
    if (!turn) {
      return NextResponse.json({ error: "Turn not found" }, { status: 404 });
    }
    const answer = (body.answerTranscript || "").trim();
    if (!answer) {
      return NextResponse.json(
        { error: "Please provide an answer (voice or text)." },
        { status: 400 },
      );
    }

    const sample =
      (await getQuestionSample(turn.questionSlug || "")) ||
      questions.find((q) => q.slug === turn.questionSlug)?.sampleAnswer ||
      "";

    const scored = await scoreInterviewAnswer({
      question: turn.questionText,
      sampleAnswer: sample,
      answer,
      targetRole: session.targetRole,
    });

    const updated = await updateTurnAnswer(turn.id, {
      answerTranscript: answer,
      audioUrl: body.audioUrl,
      score: scored.score,
      feedback: scored.feedback,
      fixAreas: scored.fixAreas,
    });

    return NextResponse.json({
      turn: updated,
      score: scored,
      remaining: questions.length - turns.length,
      session,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
