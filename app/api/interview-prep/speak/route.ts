import { NextResponse } from "next/server";
import { getOpenAiVoice } from "@/lib/interview/voices";
import type { InterviewerId } from "@/lib/interview/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  let body: { text?: string; interviewer?: InterviewerId };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const text = body.text?.trim();
  const interviewer = body.interviewer;

  if (!text) {
    return NextResponse.json({ error: "No text provided." }, { status: 400 });
  }

  if (interviewer !== "lisa" && interviewer !== "clemence") {
    return NextResponse.json({ error: "Invalid interviewer." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ mode: "browser-fallback" }, { status: 200 });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1-hd",
        input: text.slice(0, 4096),
        voice: getOpenAiVoice(interviewer),
        response_format: "mp3",
        speed: interviewer === "lisa" ? 0.95 : 0.92,
      }),
    });

    if (!response.ok) {
      console.warn("[interview-prep/speak] OpenAI TTS failed", response.status);
      return NextResponse.json({ mode: "browser-fallback" }, { status: 200 });
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[interview-prep/speak] error", err);
    return NextResponse.json({ mode: "browser-fallback" }, { status: 200 });
  }
}
