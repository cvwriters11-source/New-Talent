import type {
  InterviewApiContext,
  InterviewResults,
  TranscriptEntry,
} from "@/lib/interview/types";
import { getExecutiveReferenceForResults } from "@/lib/interview-prep";
import {
  executiveInterviewTips,
  findExecutiveSampleAnswer,
  isExecutiveRole,
} from "@/lib/interview/executive-questions";

export function buildResultsSystemPrompt(context: InterviewApiContext) {
  return `You are Talent Crafters' interview coach reviewing a completed mock interview.

Candidate: ${context.firstName} ${context.surname}
Target role: ${context.position}
Interviewer style: ${context.interviewer}

Return ONLY valid JSON with this shape:
{
  "overallScore": number from 1 to 100,
  "summary": "2-3 sentences on overall performance",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "corrections": [
    {
      "question": "the interview question",
      "candidateAnswer": "what the candidate said (short)",
      "whatWorked": "one short positive note",
      "betterAnswer": "a stronger sample answer the candidate can practise saying"
    }
  ],
  "closingAdvice": "one short encouraging next step"
}

Rules:
- Include 1-3 corrections based on real Q&A turns in the transcript.
- betterAnswer must be spoken-style, practical, and tailored to ${context.position}.
- Be supportive but honest. Do not invent questions that were not asked.
- If the transcript is very short, still give useful coaching and score fairly.${getExecutiveReferenceForResults(context)}`;
}

export function offlineInterviewResults(
  transcript: TranscriptEntry[],
  context: InterviewApiContext,
): InterviewResults {
  const userTurns = transcript.filter((t) => t.role === "user");
  const assistantTurns = transcript.filter((t) => t.role === "assistant");
  const score = Math.min(
    88,
    45 + userTurns.length * 8 + (assistantTurns.length > 0 ? 10 : 0),
  );

  const lastQuestion =
    [...assistantTurns].reverse()[0]?.content ||
    `Tell me about yourself for the ${context.position} role.`;
  const lastAnswer =
    [...userTurns].reverse()[0]?.content ||
    "No full answer was recorded in this practice session.";

  const executive = isExecutiveRole(context.position);
  const matched = findExecutiveSampleAnswer(lastQuestion);
  const betterAnswer =
    executive && matched
      ? `${matched.sampleAnswer} Adapt this to your own experience for the ${context.position} role and keep it under two minutes.`
      : `For the ${context.position} role, I would start with my current background, share one clear achievement with a measurable result, then explain why this role matches my goals. Keep it under 90 seconds and focus on what I personally delivered.`;

  const improvements =
    executive
      ? [
          "Use STAR with measurable business outcomes in every answer",
          "Lead with strategic impact and commercial awareness, not task lists",
          ...executiveInterviewTips.slice(0, 2),
        ]
      : [
          "Use the STAR method: Situation, Task, Action, Result",
          "Keep answers focused on outcomes relevant to the role",
        ];

  return {
    overallScore: score,
    summary: executive
      ? `You completed an executive practice interview for ${context.position}. Focus on leadership impact, measurable results, and concise strategic answers.`
      : `You completed a practice interview for ${context.position}. Focus on clearer examples and stronger results in your answers.`,
    strengths: executive
      ? [
          "You practised under executive interview conditions",
          "You engaged with challenging leadership-style questions",
        ]
      : [
          "You showed up and practised under interview conditions",
          "You engaged with the interviewer and kept the conversation going",
        ],
    improvements,
    corrections: [
      {
        question: (matched?.question || lastQuestion).slice(0, 220),
        candidateAnswer: lastAnswer.slice(0, 220),
        whatWorked: executive
          ? "You attempted a senior-level answer under pressure."
          : "You attempted a real interview answer under pressure.",
        betterAnswer: betterAnswer.slice(0, 900),
      },
    ],
    closingAdvice: executive
      ? "Practise your executive sample answers out loud with numbers and outcomes, then run another session to refine delivery."
      : "Practise your stronger sample answers out loud once more, then book another session to refine delivery.",
  };
}

export function parseInterviewResults(raw: string): InterviewResults | null {
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const data = JSON.parse(cleaned) as Partial<InterviewResults>;
    if (
      typeof data.overallScore !== "number" ||
      typeof data.summary !== "string" ||
      !Array.isArray(data.strengths) ||
      !Array.isArray(data.improvements) ||
      !Array.isArray(data.corrections)
    ) {
      return null;
    }
    return {
      overallScore: Math.max(1, Math.min(100, Math.round(data.overallScore))),
      summary: data.summary,
      strengths: data.strengths.filter((s): s is string => typeof s === "string"),
      improvements: data.improvements.filter(
        (s): s is string => typeof s === "string",
      ),
      corrections: data.corrections
        .filter(
          (c): c is InterviewResults["corrections"][number] =>
            Boolean(c) &&
            typeof c === "object" &&
            typeof c.question === "string" &&
            typeof c.candidateAnswer === "string" &&
            typeof c.whatWorked === "string" &&
            typeof c.betterAnswer === "string",
        )
        .slice(0, 3),
      closingAdvice:
        typeof data.closingAdvice === "string"
          ? data.closingAdvice
          : "Keep practising with focused examples.",
    };
  } catch {
    return null;
  }
}
