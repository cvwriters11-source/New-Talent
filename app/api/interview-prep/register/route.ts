import { NextResponse } from "next/server";
import {
  sbRegisterInterviewSession,
  sbUpdateInterviewSession,
} from "@/lib/admin/supabase-data";
import type { InterviewDuration, InterviewerId } from "@/lib/interview/types";

export const runtime = "nodejs";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: {
    firstName?: string;
    surname?: string;
    position?: string;
    phone?: string;
    email?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const firstName = body.firstName?.trim() || "";
  const surname = body.surname?.trim() || "";
  const position = body.position?.trim() || "";
  const phone = body.phone?.trim() || "";
  const email = body.email?.trim() || "";

  if (!firstName || !surname || !position || !phone || !email) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 },
    );
  }

  if (!isEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    const result = await sbRegisterInterviewSession({
      firstName,
      surname,
      position,
      phone,
      email,
    });

    if (!result?.id) {
      return NextResponse.json({
        sessionId: `local_${Date.now()}`,
        mode: "local",
      });
    }

    return NextResponse.json({ sessionId: result.id, mode: "database" });
  } catch (err) {
    console.error("[interview-prep/register] POST error", err);
    return NextResponse.json(
      { error: "Could not save your details. Please try again." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  let body: {
    sessionId?: string;
    status?: "registered" | "in_progress" | "completed";
    interviewer?: InterviewerId;
    durationMinutes?: InterviewDuration;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const sessionId = body.sessionId?.trim();
  if (!sessionId || sessionId.startsWith("local_")) {
    return NextResponse.json({ ok: true, mode: "local" });
  }

  try {
    await sbUpdateInterviewSession(sessionId, {
      status: body.status,
      interviewer: body.interviewer,
      durationMinutes: body.durationMinutes,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[interview-prep/register] PATCH error", err);
    return NextResponse.json(
      { error: "Could not update session." },
      { status: 500 },
    );
  }
}
