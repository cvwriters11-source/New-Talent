import { cookies } from "next/headers";
import {
  CANDIDATE_COOKIE,
  type CandidateSession,
  verifyCandidateToken,
} from "@/lib/interview/candidate-session";

export {
  CANDIDATE_COOKIE,
  createCandidateToken,
  hashPassword,
  verifyCandidateToken,
  verifyPassword,
  type CandidateSession,
} from "@/lib/interview/candidate-session";

export async function getCandidateSession(): Promise<CandidateSession | null> {
  const jar = await cookies();
  const token = jar.get(CANDIDATE_COOKIE)?.value;
  if (!token) return null;
  return verifyCandidateToken(token);
}

export async function requireCandidateSession() {
  const session = await getCandidateSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}
