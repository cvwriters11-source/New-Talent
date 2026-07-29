import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getCandidateSession } from "@/lib/interview/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await getCandidateSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Transcription unavailable without OPENAI_API_KEY." },
      { status: 503 },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("audio");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Audio file required." }, { status: 400 });
    }

    const whisperForm = new FormData();
    whisperForm.append("file", file, file.name || "answer.webm");
    whisperForm.append("model", "whisper-1");
    whisperForm.append("language", "en");

    const whisperRes = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: whisperForm,
      },
    );

    if (!whisperRes.ok) {
      const errText = await whisperRes.text();
      console.error("[interview/transcribe]", errText);
      return NextResponse.json(
        { error: "Could not transcribe audio." },
        { status: 502 },
      );
    }

    const whisperJson = (await whisperRes.json()) as { text?: string };
    const transcript = (whisperJson.text || "").trim();

    let audioUrl: string | null = null;
    if (process.env.BLOB_READ_WRITE_TOKEN && file.size > 0) {
      try {
        const blob = await put(
          `interview/${session.id}/${Date.now()}-${file.name || "answer.webm"}`,
          file,
          { access: "public", token: process.env.BLOB_READ_WRITE_TOKEN },
        );
        audioUrl = blob.url;
      } catch (blobErr) {
        console.error("[interview/transcribe] blob", blobErr);
      }
    }

    return NextResponse.json({ transcript, audioUrl });
  } catch (err) {
    console.error("[interview/transcribe]", err);
    return NextResponse.json(
      { error: "Transcription failed." },
      { status: 500 },
    );
  }
}
