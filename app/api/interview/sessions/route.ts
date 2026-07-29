import { NextResponse } from "next/server";
import { assertInterviewAccess } from "@/lib/interview/access";
import { getCandidateSession } from "@/lib/interview/auth";
import {
  INTERVIEW_DURATIONS,
  type InterviewDuration,
} from "@/lib/interview/question-bank";
import {
  createInterviewSession,
  listSessionsForCandidate,
} from "@/lib/interview/store";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCandidateSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sessions = await listSessionsForCandidate(session.id);
  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  const session = await getCandidateSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = assertInterviewAccess(session);
  if (!access.allowed) {
    return NextResponse.json(
      { error: access.reason || "Access denied." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as {
    durationMinutes?: number;
    targetRole?: string;
  };

  const duration = body.durationMinutes as InterviewDuration;
  if (!INTERVIEW_DURATIONS.includes(duration)) {
    return NextResponse.json(
      { error: "Choose 15, 30, or 60 minutes." },
      { status: 400 },
    );
  }

  const interview = await createInterviewSession({
    candidateId: session.id,
    durationMinutes: duration,
    targetRole: body.targetRole,
  });

  return NextResponse.json({ session: interview });
}
