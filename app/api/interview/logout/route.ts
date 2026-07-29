import { NextResponse } from "next/server";
import { CANDIDATE_COOKIE } from "@/lib/interview/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CANDIDATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
