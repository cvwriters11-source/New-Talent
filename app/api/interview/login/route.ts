import { NextResponse } from "next/server";
import {
  CANDIDATE_COOKIE,
  createCandidateToken,
} from "@/lib/interview/auth";
import { authenticateCandidate } from "@/lib/interview/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    const email = body.email?.trim() || "";
    const password = body.password || "";
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const candidate = await authenticateCandidate(email, password);
    if (!candidate) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const token = await createCandidateToken({
      id: candidate.id,
      email: candidate.email,
      name: candidate.name,
    });

    const res = NextResponse.json({ ok: true, candidate });
    res.cookies.set(CANDIDATE_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
    return res;
  } catch (err) {
    console.error("[interview/login]", err);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
