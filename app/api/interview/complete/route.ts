import { NextResponse } from "next/server";
import { getCandidateSession } from "@/lib/interview/auth";
import { summariseSessionScores } from "@/lib/interview/score";
import {
  completeSession,
  getSession,
  getTurnsForSession,
} from "@/lib/interview/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await getCandidateSession();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    sessionId?: string;
    abandoned?: boolean;
  };
  if (!body.sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const session = await getSession(body.sessionId);
  if (!session || session.candidateId !== auth.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const turns = await getTurnsForSession(body.sessionId);
  const summary = summariseSessionScores(turns);

  const updated = await completeSession(body.sessionId, {
    overallScore: summary.overallScore,
    summaryFeedback: summary.summaryFeedback,
    fixAreas: summary.fixAreas,
    status: body.abandoned ? "abandoned" : "completed",
  });

  return NextResponse.json({
    session: updated,
    turns,
    summary,
  });
}
