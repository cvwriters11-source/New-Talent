import { NextResponse } from "next/server";
import { uploadPublicFile } from "@/lib/uploads";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const sessionId = String(form.get("sessionId") || "session");
    const role = String(form.get("role") || "user");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No audio file." }, { status: 400 });
    }

    const folder = `interview-audio/${sessionId}/${role}`;
    const url = await uploadPublicFile(file, folder);
    if (!url) {
      return NextResponse.json(
        { error: "Could not upload audio right now." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[interview-prep/audio] upload failed", err);
    return NextResponse.json(
      { error: "Audio upload failed." },
      { status: 500 },
    );
  }
}
