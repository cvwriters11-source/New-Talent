import { NextResponse } from "next/server";
import {
  RECRUITER_COOKIE,
  createRecruiterToken,
} from "@/lib/recruiter/auth";
import { authenticateRecruiter } from "@/lib/recruiter/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = body.email?.trim() || "";
  const password = body.password || "";
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  try {
    const recruiter = await authenticateRecruiter(email, password);
    if (!recruiter) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const token = await createRecruiterToken({
      id: recruiter.id,
      email: recruiter.email,
      name: recruiter.name,
      company: recruiter.company,
    });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(RECRUITER_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
    return res;
  } catch (err) {
    if (
      err instanceof Error &&
      err.message === "SUPABASE_SERVICE_ROLE_REQUIRED"
    ) {
      return NextResponse.json(
        {
          error:
            "Recruiter login is temporarily unavailable. Please try again later.",
        },
        { status: 503 },
      );
    }
    console.error(err);
    return NextResponse.json(
      { error: "Could not sign in right now." },
      { status: 500 },
    );
  }
}
