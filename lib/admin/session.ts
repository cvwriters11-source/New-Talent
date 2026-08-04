import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE = "tc_admin_session";

export type AdminSession = {
  email: string;
  role: "admin";
};

function getSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.CONTACT_EMAIL ||
    "talent-crafters-dev-secret";
  return new TextEncoder().encode(secret);
}

export function getAdminCredentials() {
  const email = (
    process.env.ADMIN_EMAIL || "sam@talentcrafters.co.za"
  ).toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) {
    if (
      process.env.VERCEL_ENV === "production" ||
      process.env.NODE_ENV === "production"
    ) {
      return { email, password: "" };
    }
    // Local/dev only fallback — never used when ADMIN_PASSWORD is configured.
    return { email, password: "changeme-local-only" };
  }
  return { email, password };
}

export function verifyAdminCredentials(email: string, password: string) {
  const creds = getAdminCredentials();
  if (!creds.password) return false;
  return (
    email.trim().toLowerCase() === creds.email && password === creds.password
  );
}

export async function createAdminToken(email: string) {
  return new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyAdminToken(
  token: string,
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.email === "string" && payload.role === "admin") {
      return { email: payload.email, role: "admin" };
    }
    return null;
  } catch {
    return null;
  }
}
