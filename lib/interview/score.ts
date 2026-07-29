import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export type TurnScore = {
  score: number;
  feedback: string;
  fixAreas: string[];
  strengths: string[];
};

export type SessionScoreSummary = {
  overallScore: number;
  summaryFeedback: string;
  fixAreas: string[];
};

function offlineScore(
  answer: string,
  sampleAnswer: string,
  question: string,
): TurnScore {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const lengthScore =
    words.length === 0 ? 0 : words.length < 15 ? 4 : words.length < 40 ? 6 : 7;
  const sampleTokens = sampleAnswer
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 4);
  const answerLower = answer.toLowerCase();
  const overlap = sampleTokens.filter((t) => answerLower.includes(t)).length;
  const overlapScore = Math.min(
    3,
    Math.round((overlap / Math.max(8, sampleTokens.length)) * 3),
  );
  const score = Math.min(10, lengthScore + overlapScore);
  const fixAreas: string[] = [];
  if (words.length < 20) {
    fixAreas.push("Expand your answer with a concrete example from your experience.");
  }
  if (!/i\s+(did|worked|managed|led|helped|resolved)/i.test(answer)) {
    fixAreas.push("Use first-person actions so the interviewer hears what *you* did.");
  }
  if (question.toLowerCase().includes("problem") || question.toLowerCase().includes("conflict") || question.toLowerCase().includes("mistake")) {
    if (!/situation|task|action|result|because|then|after/i.test(answer)) {
      fixAreas.push("Structure behavioural answers with STAR: Situation, Task, Action, Result.");
    }
  }
  return {
    score,
    feedback:
      score >= 7
        ? "Solid answer — keep practising with clearer examples and outcomes."
        : "Your answer needs more structure and specific examples to sound interview-ready.",
    fixAreas:
      fixAreas.length > 0
        ? fixAreas
        : ["Tighten your answer and end with a positive outcome or learning."],
    strengths:
      score >= 6
        ? ["You stayed on topic and answered the question asked."]
        : [],
  };
}

export async function scoreInterviewAnswer(input: {
  question: string;
  sampleAnswer: string;
  answer: string;
  targetRole?: string | null;
}): Promise<TurnScore> {
  const answer = input.answer.trim();
  if (!answer) {
    return {
      score: 0,
      feedback: "No answer was recorded.",
      fixAreas: ["Speak or type a full answer before moving on."],
      strengths: [],
    };
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    return offlineScore(answer, input.sampleAnswer, input.question);
  }
  if (!process.env.OPENAI_API_KEY && process.env.AI_GATEWAY_API_KEY) {
    process.env.OPENAI_API_KEY = process.env.AI_GATEWAY_API_KEY;
  }

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      temperature: 0.3,
      system: `You are an interview coach for Talent Crafters Career Development.
Score the candidate's spoken answer from 0-10 against the sample quality bar (not word-for-word match).
Reward clarity, relevance, professionalism, and STAR structure for behavioural questions.
Never invent facts the candidate did not say.
Return ONLY valid JSON:
{"score":number,"feedback":string,"fixAreas":string[],"strengths":string[]}`,
      prompt: `Target role: ${input.targetRole || "general professional"}
Question: ${input.question}
Sample answer (quality bar): ${input.sampleAnswer}
Candidate answer: ${answer}`,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return offlineScore(answer, input.sampleAnswer, input.question);
    }
    const parsed = JSON.parse(jsonMatch[0]) as Partial<TurnScore>;
    const score = Math.max(0, Math.min(10, Number(parsed.score) || 0));
    return {
      score,
      feedback:
        typeof parsed.feedback === "string"
          ? parsed.feedback
          : "Keep practising with clearer examples.",
      fixAreas: Array.isArray(parsed.fixAreas)
        ? parsed.fixAreas.filter((x): x is string => typeof x === "string").slice(0, 4)
        : [],
      strengths: Array.isArray(parsed.strengths)
        ? parsed.strengths.filter((x): x is string => typeof x === "string").slice(0, 3)
        : [],
    };
  } catch (err) {
    console.error("[interview/score]", err);
    return offlineScore(answer, input.sampleAnswer, input.question);
  }
}

export function summariseSessionScores(
  turns: { score: number | null; fixAreas: string[]; feedback: string | null }[],
): SessionScoreSummary {
  const scored = turns.filter((t) => typeof t.score === "number");
  if (scored.length === 0) {
    return {
      overallScore: 0,
      summaryFeedback:
        "No scored answers yet. Complete a full practice session to get coaching feedback.",
      fixAreas: ["Answer each question fully before ending the session."],
    };
  }
  const avg =
    scored.reduce((sum, t) => sum + (t.score as number), 0) / scored.length;
  const overallScore = Math.round((avg / 10) * 100);
  const fixAreas = Array.from(
    new Set(scored.flatMap((t) => t.fixAreas)),
  ).slice(0, 6);

  let summaryFeedback: string;
  if (overallScore >= 80) {
    summaryFeedback =
      "Strong interview performance. Keep practising aloud so your delivery stays confident and concise.";
  } else if (overallScore >= 60) {
    summaryFeedback =
      "Good foundation. Focus on the fix areas below — clearer examples and tighter structure will lift your score.";
  } else {
    summaryFeedback =
      "You have room to grow. Practise the STAR method, research the company, and rehearse concise answers aloud.";
  }

  return { overallScore, summaryFeedback, fixAreas };
}
