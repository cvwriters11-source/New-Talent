import { NextResponse } from "next/server";
import { rewriteCv } from "@/lib/resume/ai";
import { parseResumeCv } from "@/lib/resume/schema";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cv = parseResumeCv(body?.cv ?? body);
    if (!cv.fullName.trim()) {
      return NextResponse.json(
        { error: "Add at least a full name before rewriting." },
        { status: 400 },
      );
    }
    const rewritten = await rewriteCv(cv);
    return NextResponse.json({ cv: rewritten });
  } catch (err) {
    console.error("[api/resume/rewrite]", err);
    return NextResponse.json(
      { error: "Could not rewrite this CV right now." },
      { status: 500 },
    );
  }
}
