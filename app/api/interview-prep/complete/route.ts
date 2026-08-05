import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import {
  sbCompleteInterviewSession,
  sbUpdateInterviewSession,
} from "@/lib/admin/supabase-data";
import {
  buildResultsSystemPrompt,
  offlineInterviewResults,
  parseInterviewResults,
} from "@/lib/interview/results";
import type {
  InterviewApiContext,
  InterviewAudioClip,
  InterviewResults,
  TranscriptEntry,
} from "@/lib/interview/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function parseContext(raw: unknown): InterviewApiContext | null {
  if (!raw || typeof raw !== "object") return null;
  const ctx = raw as Record<string, unknown>;
  if (
    typeof ctx.firstName !== "string" ||
    typeof ctx.surname !== "string" ||
    typeof ctx.position !== "string" ||
    (ctx.interviewer !== "lisa" && ctx.interviewer !== "clemence") ||
    (ctx.durationMinutes !== 15 &&
      ctx.durationMinutes !== 30 &&
      ctx.durationMinutes !== 60)
  ) {
    return null;
  }
  return {
    firstName: ctx.firstName,
    surname: ctx.surname,
    position: ctx.position,
    phone: typeof ctx.phone === "string" ? ctx.phone : "",
    email: typeof ctx.email === "string" ? ctx.email : "",
    interviewer: ctx.interviewer,
    durationMinutes: ctx.durationMinutes,
    sessionId: typeof ctx.sessionId === "string" ? ctx.sessionId : undefined,
  };
}

function asTranscript(raw: unknown): TranscriptEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      if (
        typeof row.id !== "string" ||
        (row.role !== "user" &&
          row.role !== "assistant" &&
          row.role !== "system") ||
        typeof row.content !== "string"
      ) {
        return null;
      }
      return {
        id: row.id,
        role: row.role,
        content: row.content,
      };
    })
    .filter((v): v is TranscriptEntry => Boolean(v));
}

function asAudioClips(raw: unknown): InterviewAudioClip[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      if (
        typeof row.id !== "string" ||
        (row.role !== "user" &&
          row.role !== "assistant" &&
          row.role !== "system") ||
        typeof row.url !== "string"
      ) {
        return null;
      }
      return {
        id: row.id,
        role: row.role,
        url: row.url,
        text: typeof row.text === "string" ? row.text : undefined,
      };
    })
    .filter((v): v is InterviewAudioClip => Boolean(v));
}

async function generateResults(
  transcript: TranscriptEntry[],
  context: InterviewApiContext,
): Promise<InterviewResults> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) return offlineInterviewResults(transcript, context);

  if (!process.env.OPENAI_API_KEY && process.env.AI_GATEWAY_API_KEY) {
    process.env.OPENAI_API_KEY = process.env.AI_GATEWAY_API_KEY;
  }

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: buildResultsSystemPrompt(context),
      prompt: `Interview transcript:\n${transcript
        .map((line) => `${line.role.toUpperCase()}: ${line.content}`)
        .join("\n\n")}`,
      temperature: 0.4,
    });
    return (
      parseInterviewResults(text || "") ||
      offlineInterviewResults(transcript, context)
    );
  } catch (err) {
    console.error("[interview-prep/complete] results generation failed", err);
    return offlineInterviewResults(transcript, context);
  }
}

export async function POST(request: Request) {
  let body: {
    sessionId?: string;
    context?: unknown;
    transcript?: unknown;
    audioClips?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const context = parseContext(body.context);
  if (!context) {
    return NextResponse.json(
      { error: "Missing interview context." },
      { status: 400 },
    );
  }

  const transcript = asTranscript(body.transcript);
  const audioClips = asAudioClips(body.audioClips);
  const sessionId = body.sessionId?.trim() || context.sessionId;

  const results = await generateResults(transcript, context);

  if (sessionId && !sessionId.startsWith("local_")) {
    try {
      await sbCompleteInterviewSession(sessionId, {
        transcript,
        results,
        overallScore: results.overallScore,
        audioClips,
      });
    } catch (err) {
      console.error("[interview-prep/complete] save failed", err);
      try {
        await sbUpdateInterviewSession(sessionId, { status: "completed" });
      } catch {
        /* ignore */
      }
    }
  }

  return NextResponse.json({
    results,
    sessionId: sessionId || null,
  });
}
