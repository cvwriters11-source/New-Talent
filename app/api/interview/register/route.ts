import { NextResponse } from "next/server";
import {
  CANDIDATE_COOKIE,
  createCandidateToken,
} from "@/lib/interview/auth";
import { registerCandidate } from "@/lib/interview/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      whatsapp?: string;
    };

    const name = body.name?.trim() || "";
    const email = body.email?.trim() || "";
    const password = body.password || "";

    if (name.length < 2) {
      return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
    }
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    const candidate = await registerCandidate({
      name,
      email,
      password,
      whatsapp: body.whatsapp,
    });

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
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 409 },
      );
    }
    console.error("[interview/register]", err);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
