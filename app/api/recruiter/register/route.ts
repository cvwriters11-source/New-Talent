import { NextResponse } from "next/server";
import {
  RECRUITER_COOKIE,
  createRecruiterToken,
} from "@/lib/recruiter/auth";
import { registerRecruiter } from "@/lib/recruiter/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    name?: string;
    email?: string;
    password?: string;
    company?: string;
    whatsapp?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = body.name?.trim() || "";
  const email = body.email?.trim() || "";
  const password = body.password || "";
  const company = body.company?.trim() || "";
  const whatsapp = body.whatsapp?.trim() || "";

  if (name.length < 2) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }
  if (company.length < 2) {
    return NextResponse.json({ error: "Company is required." }, { status: 400 });
  }

  try {
    const recruiter = await registerRecruiter({
      name,
      email,
      password,
      company,
      whatsapp: whatsapp || undefined,
    });
    const token = await createRecruiterToken({
      id: recruiter.id,
      email: recruiter.email,
      name: recruiter.name,
      company: recruiter.company,
    });
    const res = NextResponse.json({ ok: true, recruiter });
    res.cookies.set(RECRUITER_COOKIE, token, {
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
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }
    console.error(err);
    return NextResponse.json(
      { error: "Could not create account." },
      { status: 500 },
    );
  }
}
