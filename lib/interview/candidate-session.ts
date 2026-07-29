import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";

export const CANDIDATE_COOKIE = "tc_candidate_session";

export type CandidateSession = {
  id: string;
  email: string;
  name: string;
  role: "candidate";
};

function getSecret() {
  const secret =
    process.env.CANDIDATE_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.CONTACT_EMAIL ||
    "talent-crafters-candidate-dev-secret";
  return new TextEncoder().encode(secret);
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const test = scryptSync(password, salt, 64);
  if (hashBuf.length !== test.length) return false;
  return timingSafeEqual(hashBuf, test);
}

export async function createCandidateToken(payload: {
  id: string;
  email: string;
  name: string;
}) {
  return new SignJWT({
    id: payload.id,
    email: payload.email,
    name: payload.name,
    role: "candidate",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(getSecret());
}

export async function verifyCandidateToken(
  token: string,
): Promise<CandidateSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.id === "string" &&
      typeof payload.email === "string" &&
      typeof payload.name === "string" &&
      payload.role === "candidate"
    ) {
      return {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: "candidate",
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** Stable id helper when creating local fallback candidates. */
export function localCandidateId(email: string) {
  return createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 32);
}
