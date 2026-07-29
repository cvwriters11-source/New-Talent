import { NextResponse } from "next/server";
import { getCandidateSession } from "@/lib/interview/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await getCandidateSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { text?: string };
  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Voice is unavailable without OPENAI_API_KEY.",
        offline: true,
      },
      { status: 503 },
    );
  }

  try {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: "alloy",
        input: text.slice(0, 4000),
        response_format: "mp3",
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[interview/speak]", errText);
      return NextResponse.json(
        { error: "Could not generate speech." },
        { status: 502 },
      );
    }

    const audio = await res.arrayBuffer();
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[interview/speak]", err);
    return NextResponse.json(
      { error: "Speech generation failed." },
      { status: 500 },
    );
  }
}
