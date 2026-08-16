import type {
  InterviewApiContext,
  InterviewDuration,
  InterviewerId,
  InterviewSession,
} from "@/lib/interview/types";
import {
  buildExecutiveQuestionPrompt,
  executiveInterviewQuestions,
  executiveInterviewTips,
  findExecutiveSampleAnswer,
  getOfflineExecutiveQuestion,
  isExecutiveRole,
  questionsForDuration,
} from "@/lib/interview/executive-questions";

export const interviewPrepStarters = [
  "Start a mock interview",
  "Practice “Tell me about yourself”",
  "Executive leadership questions",
  "Questions I should ask the employer",
] as const;

export const INTERVIEWERS: Record<
  InterviewerId,
  {
    name: string;
    title: string;
    description: string;
    voiceLabel: string;
    gender: "female" | "male";
  }
> = {
  lisa: {
    name: "Lisa",
    title: "HR & Behavioural Specialist",
    description:
      "Warm African woman with an encouraging style — behavioural questions, STAR answers, and confidence building.",
    voiceLabel: "African woman",
    gender: "female",
  },
  clemence: {
    name: "Clemence",
    title: "Senior Hiring Manager",
    description:
      "Direct African man with a professional tone — challenging role-specific questions and concise feedback.",
    voiceLabel: "African man",
    gender: "male",
  },
};

export const DURATION_OPTIONS: {
  minutes: InterviewDuration;
  label: string;
  description: string;
}[] = [
  { minutes: 15, label: "15 minutes", description: "Quick warm-up session" },
  { minutes: 30, label: "30 minutes", description: "Standard mock interview" },
  { minutes: 60, label: "1 hour", description: "Full in-depth practice" },
];

const baseKnowledge = `
You are Talent Crafters' AI Interview Preparation Coach conducting a live voice mock interview.

Your role:
- Run a realistic mock interview tailored to the candidate's target role.
- Ask one clear interview question at a time, then wait for the candidate's spoken answer.
- After each answer, give brief constructive feedback (what worked, one improvement) then ask the next question.
- Keep every reply short enough to speak aloud in under 30 seconds when possible.
- Do not use markdown, bullet lists, or formatting — plain spoken sentences only.
- Do not invent job offers or guarantee hiring outcomes.

Voice interview rules:
- Speak naturally as the interviewer persona assigned to you.
- One question per turn unless wrapping up.
- Pace questions to fit the session duration.
- When time is almost up, thank the candidate and give a brief closing summary.
`.trim();

export function getInterviewerName(id: InterviewerId) {
  return INTERVIEWERS[id].name;
}

export function getGreetingScript(session: Pick<
  InterviewSession,
  "firstName" | "position" | "interviewer" | "durationMinutes"
>) {
  const name = getInterviewerName(session.interviewer);
  const first = session.firstName.trim();
  const firstName = first
    ? first.charAt(0).toUpperCase() + first.slice(1)
    : "there";
  const durationLabel =
    session.durationMinutes === 60
      ? "one hour"
      : `${session.durationMinutes} minutes`;

  return `Hello ${firstName}, I'm ${name}. I'll be conducting your interview practice for the ${session.position.trim()} role. We have ${durationLabel} together. When you're ready, I'll ask your first question.`;
}

export function buildInterviewSystemPrompt(context: InterviewApiContext) {
  const elapsed = context.elapsedMinutes ?? 0;
  const remaining = Math.max(0, context.durationMinutes - elapsed);
  const phase = context.phase || "interview";

  const persona =
    context.interviewer === "lisa"
      ? "You are Lisa, a warm African woman and HR specialist. Focus on behavioural questions, teamwork, and communication. Be encouraging."
      : "You are Clemence, a direct African man and senior hiring manager. Ask sharp role-specific questions. Be professional and concise.";

  const phaseInstruction =
    phase === "wrapup"
      ? "Time is almost up. Give brief final feedback and a professional closing. Do not ask new questions."
      : phase === "greeting"
        ? "The candidate is ready. Ask your first interview question only — no long introduction."
        : "Continue the mock interview with feedback on the last answer, then one new question.";

  const executiveBlock = isExecutiveRole(context.position)
    ? `\n\n${buildExecutiveQuestionPrompt(context.position, context.durationMinutes)}`
    : "";

  return `${baseKnowledge}

${persona}

Candidate: ${context.firstName} ${context.surname}
Target role: ${context.position}
Session length: ${context.durationMinutes} minutes
Elapsed: ~${elapsed} min | Remaining: ~${remaining} min
Phase: ${phase}

${phaseInstruction}${executiveBlock}`;
}

export function offlineInterviewReply(
  question: string,
  context?: string,
  apiContext?: InterviewApiContext,
) {
  const q = question.toLowerCase();
  const role = apiContext?.position?.trim() || context?.trim() || "your target role";
  const firstName = apiContext?.firstName || "there";
  const interviewer = apiContext?.interviewer
    ? getInterviewerName(apiContext.interviewer)
    : "your interviewer";
  const executive = apiContext ? isExecutiveRole(apiContext.position) : false;
  const duration = apiContext?.durationMinutes || 30;

  if (
    q.includes("[start interview]") ||
    q.includes("first question") ||
    q.includes("ready")
  ) {
    if (executive) {
      const first = getOfflineExecutiveQuestion(0, duration);
      return `Thank you for joining, ${firstName}. Let's begin your executive practice for ${role}. ${first.question}`;
    }
    return `Thank you for joining, ${firstName}. Let's begin. Tell me about yourself and why you are interested in the ${role} position.`;
  }

  if (apiContext?.phase === "wrapup") {
    if (executive) {
      return `Thank you ${firstName}. You showed strong effort in this executive practice. Focus on business impact, measurable results, and the STAR method. Best of luck with your ${role} interviews.`;
    }
    return `Thank you ${firstName}. You showed good effort today. Focus on giving specific examples with clear results. Best of luck with your ${role} interviews.`;
  }

  if (q.includes("executive") || q.includes("leadership question")) {
    const first = executiveInterviewQuestions[0];
    return `${first.question} For an executive role, structure your answer around strategic impact and measurable outcomes.`;
  }

  if (q.includes("mock") || q.includes("start")) {
    if (executive) {
      const first = getOfflineExecutiveQuestion(0, duration);
      return `Great, let's begin your executive mock interview for ${role}. ${first.question}`;
    }
    return `Great, let's begin your mock interview for ${role}. Tell me about yourself and why you are interested in this position.`;
  }

  if (q.includes("tell me about yourself")) {
    const sample = findExecutiveSampleAnswer("Tell us about yourself.");
    if (executive && sample) {
      return `Structure your answer like a senior leader: current scope, one measurable achievement, then why this ${role} fits your goals. Aim for ninety seconds with business impact, not a full career history.`;
    }
    return `Structure your answer in three parts: where you are now, a relevant achievement, and why this ${role} fits your goals. Keep it under ninety seconds.`;
  }

  if (q.includes("behavioural") || q.includes("star")) {
    if (executive) {
      return `Use STAR with executive framing: Situation, Task, Action, Result — always ending with a measurable business outcome. Try: tell me about a difficult decision you had to make.`;
    }
    return `Use STAR: Situation, Task, Action, Result. Try answering: tell me about a time you handled a difficult deadline.`;
  }

  if (executive) {
    const userTurns = (question.match(/\[answer\]/g) || []).length;
    const next = getOfflineExecutiveQuestion(Math.max(1, userTurns), duration);
    const matched = findExecutiveSampleAnswer(question);
    if (matched && q.includes("feedback")) {
      return `Good effort. For "${matched.question}", strengthen your answer with a clear result and numbers where possible. Then we'll move to the next question.`;
    }
    return `${interviewer} here. ${next.question}`;
  }

  return `${interviewer} here. For ${role}, give me a specific example from your experience that shows you can succeed in this role.`;
}

export function getExecutiveReferenceForResults(context: InterviewApiContext) {
  if (!isExecutiveRole(context.position)) return "";
  const count = questionsForDuration(context.durationMinutes).length;
  return `\n\nUse this executive coaching reference when writing betterAnswer fields. Adapt sample answers to ${context.position} — do not copy verbatim unless the candidate gave almost no answer:\n${executiveInterviewQuestions
    .slice(0, count)
    .map((item) => `Q: ${item.question}\nSample: ${item.sampleAnswer}`)
    .join("\n\n")}\n\nTips:\n${executiveInterviewTips.map((t) => `- ${t}`).join("\n")}`;
}

export function stripMarkdownForSpeech(text: string) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^[-•]\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim();
}
