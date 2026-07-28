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
  return {
    email: (process.env.ADMIN_EMAIL || "sam@talentcrafters.co.za").toLowerCase(),
    password: process.env.ADMIN_PASSWORD || "Gospelman",
  };
}

export function verifyAdminCredentials(email: string, password: string) {
  const creds = getAdminCredentials();
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
