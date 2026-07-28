import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { IRCC_HOME, irccKnowledge } from "@/lib/ircc-knowledge";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

function offlineAnswer(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("express entry") || q.includes("crs")) {
    return `Express Entry is IRCC’s system for managing applications to certain economic permanent residence programs (Federal Skilled Worker, Federal Skilled Trades, and Canadian Experience Class). You create a profile, get a CRS score, and may receive an Invitation to Apply in a draw.

Official IRCC page: https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html

This is general information only — always verify on IRCC. Talent Crafters can help strengthen your CV/résumé and LinkedIn for Canadian job applications.`;
  }
  if (q.includes("work permit") || q.includes("work in canada")) {
    return `Most people need a work permit to work in Canada temporarily. Depending on your situation you may need an employer-specific permit (often with an LMIA) or may qualify for an open work permit. Some short roles are exempt.

Official IRCC work page: https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html

Always confirm requirements on IRCC before applying.`;
  }
  if (q.includes("study") || q.includes("student")) {
    return `Most international students need a study permit for programs longer than six months, plus a letter of acceptance from a Designated Learning Institution (DLI).

Official IRCC study page: https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html

Verify details on IRCC — rules change.`;
  }
  if (q.includes("visitor") || q.includes("eta") || q.includes("tourist")) {
    return `To visit Canada you may need a visitor visa (Temporary Resident Visa) or an Electronic Travel Authorization (eTA), depending on your nationality and travel document.

Official IRCC visit page: https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html

Use IRCC’s tools to check what you need.`;
  }
  if (
    q.includes("talent crafters") ||
    q.includes("package") ||
    q.includes("cv") ||
    q.includes("resume") ||
    q.includes("résumé")
  ) {
    return `Talent Crafters Career Development offers Graduate, Professional, Executive, and International résumé packages — ATS-friendly writing, LinkedIn optimisation, and related job-search support. We are not an immigration law firm.

For immigration decisions, rely on IRCC (${IRCC_HOME}) or a licensed consultant/lawyer. Browse Packages on this site to check out.`;
  }
  return `Thanks for your question about relocating to Canada. For official, up-to-date rules, start at IRCC: ${IRCC_HOME}

Common topics we can explain at a high level: Express Entry, work permits, study permits, visitor visas/eTA, and how Talent Crafters supports your career documents.

This chat is general guidance only — not legal advice.`;
}

export async function POST(request: Request) {
  let body: { messages?: ChatMessage[] };
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

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const question = lastUser?.content?.trim() || "";
  if (!question) {
    return NextResponse.json({ error: "Empty message." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      reply: offlineAnswer(question),
      mode: "offline-ircc",
    });
  }

  if (!process.env.OPENAI_API_KEY && process.env.AI_GATEWAY_API_KEY) {
    process.env.OPENAI_API_KEY = process.env.AI_GATEWAY_API_KEY;
  }

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: irccKnowledge,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.4,
    });

    return NextResponse.json({
      reply: text || offlineAnswer(question),
      mode: "ai",
    });
  } catch (err) {
    console.error("[chat] generateText error", err);
    return NextResponse.json({
      reply: offlineAnswer(question),
      mode: "offline-fallback",
    });
  }
}
