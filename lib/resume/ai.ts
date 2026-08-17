import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  extractJsonObject,
  offlineRewrite,
  PARSE_SYSTEM_PROMPT,
  REWRITE_SYSTEM_PROMPT,
} from "@/lib/resume/prompts";
import {
  emptyResumeCv,
  normalizeResumeCv,
  parseResumeCv,
  type ResumeCv,
} from "@/lib/resume/schema";
import {
  ensureStructuredExperience,
  extractExperienceFromText,
} from "@/lib/resume/structure";

export function ensureOpenAiKey() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY;
  if (!process.env.OPENAI_API_KEY && process.env.AI_GATEWAY_API_KEY) {
    process.env.OPENAI_API_KEY = process.env.AI_GATEWAY_API_KEY;
  }
  return apiKey;
}

export async function parseCvFromText(rawText: string): Promise<ResumeCv> {
  const text = rawText.trim();
  if (!text) return emptyResumeCv();

  const apiKey = ensureOpenAiKey();
  if (!apiKey) {
    return ensureStructuredExperience(normalizeResumeCv(heuristicParse(text)), text);
  }

  try {
    const { text: out } = await generateText({
      model: openai("gpt-4o-mini"),
      system: PARSE_SYSTEM_PROMPT,
      prompt: `Extract CV JSON from this document text:\n\n${text.slice(0, 24000)}`,
      temperature: 0.2,
    });
    const json = extractJsonObject(out || "");
    const parsed = parseResumeCv(json);
    if (parsed.fullName) {
      return ensureStructuredExperience(parsed, text);
    }
    return ensureStructuredExperience(normalizeResumeCv(heuristicParse(text)), text);
  } catch (err) {
    console.error("[resume] parse failed", err);
    return ensureStructuredExperience(normalizeResumeCv(heuristicParse(text)), text);
  }
}

export async function rewriteCv(cv: ResumeCv): Promise<ResumeCv> {
  const apiKey = ensureOpenAiKey();
  if (!apiKey) {
    return ensureStructuredExperience(offlineRewrite(cv));
  }

  try {
    const { text: out } = await generateText({
      model: openai("gpt-4o-mini"),
      system: REWRITE_SYSTEM_PROMPT,
      prompt: JSON.stringify(cv),
      temperature: 0.35,
    });
    const json = extractJsonObject(out || "");
    const parsed = parseResumeCv(json);
    if (parsed.fullName) {
      return ensureStructuredExperience(parsed);
    }
    return ensureStructuredExperience(offlineRewrite(cv));
  } catch (err) {
    console.error("[resume] rewrite failed", err);
    return ensureStructuredExperience(offlineRewrite(cv));
  }
}

function sectionBody(text: string, heading: RegExp): string {
  const flags = [...new Set(`${heading.flags.replace("g", "")}g`)].join("");
  const matches = [...text.matchAll(new RegExp(heading.source, flags))];
  const match = matches.at(-1);
  if (!match || match.index === undefined) return "";
  const start = match.index + match[0].length;
  const rest = text.slice(start);
  const next = rest.search(
    /\n\s*(SUMMARY|PERSONAL SUMMARY|PROFILE|EXPERIENCE|PROFESSIONAL EXPERIENCE|CAREER HISTORY|WORK HISTORY|EMPLOYMENT|EDUCATION|SKILLS|KEY SKILLS|AFFILIATIONS|AWARDS|REFERENCES|LANGUAGES|CERTIFICATIONS|DEVELOPMENT)\b/i,
  );
  return (next >= 0 ? rest.slice(0, next) : rest).trim();
}

function heuristicParse(text: string): ResumeCv {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const email =
    text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phone =
    text.match(/(\+?\d[\d\s()-]{7,}\d)/)?.[0]?.replace(/\s+/g, " ") || "";
  const linkedin =
    text.match(/https?:\/\/[^\s]*linkedin\.com\/[^\s]+/i)?.[0] ||
    text.match(/linkedin\.com\/[^\s]+/i)?.[0] ||
    "";

  const contactLine =
    lines.find(
      (l) =>
        l.includes("|") &&
        (l.toLowerCase().includes("@") || /\d{3}/.test(l)),
    ) || "";
  const locationFromContact =
    contactLine
      .split("|")
      .map((p) => p.trim())
      .find((p) => {
        if (!p || p.includes("@") || /linkedin/i.test(p)) return false;
        const digits = p.replace(/\D/g, "");
        return digits.length < 7;
      }) || "";

  let summary =
    sectionBody(
      text,
      /(?:^|\n)\s*(?:PERSONAL\s+SUMMARY|PROFESSIONAL\s+SUMMARY|SUMMARY|PROFILE)\b[:\s]*/i,
    ) ||
    lines
      .slice(2, 10)
      .filter((l) => !l.includes("@") && !l.includes("|"))
      .join(" ");
  summary = summary
    .replace(/\b(?:EDUCATION|CAREER\s+HISTORY|PROFESSIONAL\s+EXPERIENCE|KEY\s+SKILLS)[\s\S]*$/i, "")
    .trim();

  const skillsRaw = sectionBody(
    text,
    /(?:^|\n)\s*(?:KEY\s+SKILLS|SKILLS|COMPETENCIES)\b[:\s]*/i,
  );
  const skills = skillsRaw
    ? skillsRaw
        .split(/[\n,•·|;]+/)
        .map((s) => s.replace(/^[-*]\s*/, "").trim())
        .filter((s) => s.length > 1 && s.length < 48 && !/^[a-z]/.test(s))
    : [];

  const educationRaw = sectionBody(text, /(?:^|\n)\s*EDUCATION\b[:\s]*/i);
  const education = educationRaw
    ? educationRaw
        .split(/\n/)
        .map((l) => l.replace(/^[-*]\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 6)
        .map((line) => {
          const parts = line.split(/[,|–—]/).map((p) => p.trim()).filter(Boolean);
          const year =
            line.match(/\b(?:19|20)\d{2}(?:\s*[-–—]\s*(?:(?:19|20)\d{2}|Present|Current))?\b/i)?.[0] ||
            "";
          return {
            degree: parts[0] || line,
            institution: parts.find((p) => /university|college|school|unisa|uct|wits/i.test(p)) || parts[1] || "",
            year,
          };
        })
    : [];

  const experience = extractExperienceFromText(text);

  const languagesRaw = sectionBody(text, /\bLANGUAGES?\b[:\s]*/i);
  const languages = languagesRaw
    ? languagesRaw
        .split(/[\n,|•·]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const fullNameLine =
    lines.find((line) => !/curriculum vitae|resume/i.test(line) && !line.includes("@")) ||
    lines[0] ||
    "";
  const titled = (lines[0] || "").match(
    /^(?:CURRICULUM\s+VITAE|CV|RESUME)\s+(?:OF|FOR)\s+(.+?)(?:\s*[|–—]\s*(.+))?$/i,
  );

  return {
    ...emptyResumeCv(),
    fullName: titled?.[1] || fullNameLine,
    headline:
      titled?.[2] ||
      (lines[1] && !lines[1].includes("@") && lines[1] !== fullNameLine ? lines[1] : ""),
    email,
    phone,
    linkedin,
    location: locationFromContact || "",
    languages,
    summary,
    skills,
    experience,
    education,
  };
}
