import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import {
  getCandidateById,
  getSession,
  getTurnsForSession,
  listAllSessions,
  listCandidates,
} from "@/lib/interview/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (sessionId) {
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const [turns, candidate] = await Promise.all([
      getTurnsForSession(sessionId),
      getCandidateById(session.candidateId),
    ]);
    return NextResponse.json({ session, turns, candidate });
  }

  const [candidates, sessions] = await Promise.all([
    listCandidates(),
    listAllSessions(),
  ]);

  return NextResponse.json({ candidates, sessions });
}
