import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";

export const RECRUITER_COOKIE = "tc_recruiter_session";

export type RecruiterSession = {
  id: string;
  email: string;
  name: string;
  company: string;
  role: "recruiter";
};

function getSecret() {
  const secret =
    process.env.RECRUITER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.CONTACT_EMAIL ||
    "talent-crafters-recruiter-dev-secret";
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

export async function createRecruiterToken(payload: {
  id: string;
  email: string;
  name: string;
  company: string;
}) {
  return new SignJWT({
    id: payload.id,
    email: payload.email,
    name: payload.name,
    company: payload.company,
    role: "recruiter",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(getSecret());
}

export async function verifyRecruiterToken(
  token: string,
): Promise<RecruiterSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.id === "string" &&
      typeof payload.email === "string" &&
      typeof payload.name === "string" &&
      typeof payload.company === "string" &&
      payload.role === "recruiter"
    ) {
      return {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        company: payload.company,
        role: "recruiter",
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function localRecruiterId(email: string) {
  return createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 32);
}
