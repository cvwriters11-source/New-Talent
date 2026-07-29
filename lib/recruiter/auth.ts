import { cookies } from "next/headers";
import {
  RECRUITER_COOKIE,
  type RecruiterSession,
  verifyRecruiterToken,
} from "@/lib/recruiter/session";

export {
  RECRUITER_COOKIE,
  createRecruiterToken,
  hashPassword,
  verifyPassword,
  verifyRecruiterToken,
  type RecruiterSession,
} from "@/lib/recruiter/session";

export async function getRecruiterSession(): Promise<RecruiterSession | null> {
  const jar = await cookies();
  const token = jar.get(RECRUITER_COOKIE)?.value;
  if (!token) return null;
  return verifyRecruiterToken(token);
}

export async function requireRecruiterSession() {
  const session = await getRecruiterSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}
