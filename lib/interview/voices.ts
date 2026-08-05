import type { InterviewerId } from "@/lib/interview/types";

/** OpenAI TTS voices — natural, human-like speech */
export function getOpenAiVoice(interviewer: InterviewerId): string {
  return interviewer === "lisa" ? "shimmer" : "onyx";
}

const AFRICAN_PATTERNS =
  /africa|south africa|zulu|afrikaans|sotho|xhosa|tswana|venda|pedi|swazi|ndebele|en-za/i;
const FEMALE_PATTERNS =
  /female|woman|girl|zira|samantha|karen|tessa|leah|hazel|susan|ayanda|thando|nomvula|lindiwe|precious/i;
const MALE_PATTERNS =
  /male|man|boy|david|james|daniel|mark|george|thabo|sipho|andile|bongani|siyabonga|mthokozisi/i;

function scoreVoice(voice: SpeechSynthesisVoice, interviewer: InterviewerId) {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  const wantsFemale = interviewer === "lisa";
  let score = 0;

  if (lang === "en-za" || lang.startsWith("en-za")) score += 60;
  if (AFRICAN_PATTERNS.test(name) || AFRICAN_PATTERNS.test(lang)) score += 45;
  if (lang.startsWith("en")) score += 10;

  if (wantsFemale && FEMALE_PATTERNS.test(name)) score += 35;
  if (!wantsFemale && MALE_PATTERNS.test(name)) score += 35;

  if (wantsFemale && MALE_PATTERNS.test(name)) score -= 40;
  if (!wantsFemale && FEMALE_PATTERNS.test(name)) score -= 40;

  return score;
}

export function pickInterviewerVoice(
  voices: SpeechSynthesisVoice[],
  interviewer: InterviewerId,
) {
  if (voices.length === 0) return undefined;

  const ranked = [...voices].sort(
    (a, b) => scoreVoice(b, interviewer) - scoreVoice(a, interviewer),
  );

  return ranked[0];
}

export function getInterviewerSpeechLang(_interviewer: InterviewerId) {
  return "en-ZA";
}

export function getInterviewerPitch(interviewer: InterviewerId) {
  return interviewer === "lisa" ? 1.05 : 0.9;
}

export function getInterviewerRate(interviewer: InterviewerId) {
  return interviewer === "lisa" ? 0.92 : 0.9;
}
