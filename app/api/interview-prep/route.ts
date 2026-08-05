import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import {
  buildInterviewSystemPrompt,
  offlineInterviewReply,
  stripMarkdownForSpeech,
} from "@/lib/interview-prep";
import type { InterviewApiContext } from "@/lib/interview/types";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

function parseContext(raw: unknown): InterviewApiContext | null {
  if (!raw || typeof raw !== "object") return null;
  const ctx = raw as Record<string, unknown>;
  const interviewer = ctx.interviewer;
  const duration = ctx.durationMinutes;

  if (
    typeof ctx.firstName !== "string" ||
    typeof ctx.surname !== "string" ||
    typeof ctx.position !== "string" ||
    (interviewer !== "lisa" && interviewer !== "clemence") ||
    (duration !== 15 && duration !== 30 && duration !== 60)
  ) {
    return null;
  }

  return {
    firstName: ctx.firstName,
    surname: ctx.surname,
    position: ctx.position,
    phone: typeof ctx.phone === "string" ? ctx.phone : "",
    email: typeof ctx.email === "string" ? ctx.email : "",
    interviewer,
    durationMinutes: duration,
    phase:
      ctx.phase === "greeting" ||
      ctx.phase === "interview" ||
      ctx.phase === "wrapup"
        ? ctx.phase
        : "interview",
    elapsedMinutes:
      typeof ctx.elapsedMinutes === "number" ? ctx.elapsedMinutes : 0,
    sessionId: typeof ctx.sessionId === "string" ? ctx.sessionId : undefined,
  };
}

export async function POST(request: Request) {
  let body: {
    messages?: ChatMessage[];
    context?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const messages = body.messages || [];
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "No messages provided." },
      { status: 400 },
    );
  }

  const apiContext = parseContext(body.context);
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const question = lastUser?.content?.trim() || "";
  if (!question) {
    return NextResponse.json({ error: "Empty message." }, { status: 400 });
  }

  const legacyContext =
    body.context && typeof body.context === "object"
      ? (body.context as { role?: string; company?: string; level?: string })
      : undefined;

  const contextLine = apiContext
    ? `${apiContext.position} · ${apiContext.interviewer}`
    : [
        legacyContext?.role?.trim()
          ? `Target role: ${legacyContext.role.trim()}`
          : "",
        legacyContext?.company?.trim()
          ? `Company: ${legacyContext.company.trim()}`
          : "",
        legacyContext?.level?.trim()
          ? `Experience level: ${legacyContext.level.trim()}`
          : "",
      ]
        .filter(Boolean)
        .join(" · ");

  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    const reply = stripMarkdownForSpeech(
      offlineInterviewReply(question, contextLine, apiContext || undefined),
    );
    return NextResponse.json({ reply, mode: "offline" });
  }

  if (!process.env.OPENAI_API_KEY && process.env.AI_GATEWAY_API_KEY) {
    process.env.OPENAI_API_KEY = process.env.AI_GATEWAY_API_KEY;
  }

  const system = apiContext
    ? buildInterviewSystemPrompt(apiContext)
    : contextLine
      ? `You are Talent Crafters' AI Interview Preparation Coach.\n\nCandidate context: ${contextLine}`
      : "You are Talent Crafters' AI Interview Preparation Coach.";

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.5,
    });

    const reply = stripMarkdownForSpeech(
      text || offlineInterviewReply(question, contextLine, apiContext || undefined),
    );

    return NextResponse.json({ reply, mode: "ai" });
  } catch (err) {
    console.error("[interview-prep] generateText error", err);
    const reply = stripMarkdownForSpeech(
      offlineInterviewReply(question, contextLine, apiContext || undefined),
    );
    return NextResponse.json({ reply, mode: "offline-fallback" });
  }
}
