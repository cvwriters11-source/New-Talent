import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  type AdminSession,
  verifyAdminToken,
} from "@/lib/admin/session";

export {
  ADMIN_COOKIE,
  createAdminToken,
  getAdminCredentials,
  verifyAdminCredentials,
  verifyAdminToken,
  type AdminSession,
} from "@/lib/admin/session";

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
