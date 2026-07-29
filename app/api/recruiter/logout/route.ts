import { NextResponse } from "next/server";
import { RECRUITER_COOKIE } from "@/lib/recruiter/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(RECRUITER_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
