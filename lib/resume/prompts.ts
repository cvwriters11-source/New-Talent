import type { ResumeCv } from "@/lib/resume/schema";

export const PARSE_SYSTEM_PROMPT = `You extract structured CV/resume data from raw text.
Return ONLY valid JSON matching this shape (no markdown fences):
{
  "fullName": string,
  "headline": string,
  "phone": string,
  "email": string,
  "location": string,
  "linkedin": string,
  "languages": string[],
  "summary": string,
  "education": [{ "degree": string, "institution": string, "year": string }],
  "skills": string[],
  "experience": [{
    "company": string,
    "location": string,
    "title": string,
    "startDate": string,
    "endDate": string,
    "intro": string,
    "bullets": string[]
  }],
  "affiliations": [{ "title": string, "detail": string, "year": string }],
  "professionalDevelopment": [{ "title": string, "detail": string, "year": string }],
  "awards": [{ "title": string, "detail": string, "year": string }],
  "referencesNote": string
}
Preserve facts. Do not invent employers, degrees, or dates. Use empty strings/arrays when unknown.
For summary, you may wrap key professional phrases in **double asterisks** for emphasis.
CRITICAL experience rules (Samuel template layout):
- Put EVERY job from Career History / Professional Experience / Work History into "experience".
- Each job must be a separate object with company, location, title, startDate, endDate, intro, bullets.
- Never dump whole paragraphs into skills.
- Never put job history into summary.
- Bullets must be complete duty/achievement lines, not mid-sentence fragments.`;

export const REWRITE_SYSTEM_PROMPT = `You are an expert CV writer for Talent Crafters (Africa + international ATS-friendly CVs).
Rewrite the candidate CV JSON to be clearer, more achievement-focused, and recruiter-ready.
Rules:
- Preserve all true facts (employers, titles, dates, education). Do not invent new jobs or degrees.
- Keep EVERY role in "experience" as a separate job object matching the Samuel template:
  company | location, dates on the right, bold title, optional intro, then bullets.
- Strengthen bullets with action verbs and measurable impact where the source supports it.
- Keep a professional tone suitable for banking/finance/operations roles when relevant.
- In "summary", use **bold** markers around important keywords/phrases (sparingly).
- Keep skills as a flat list of concise skill names (2-5 words each). No sentence fragments.
- If experience is missing or malformed, rebuild it from any career/job facts present in the input.
- Return ONLY valid JSON in the same schema as the input. No markdown fences.`;

export function offlineRewrite(cv: ResumeCv): ResumeCv {
  return {
    ...cv,
    summary: cv.summary.trim(),
    skills: cv.skills.map((s) => s.trim()).filter(Boolean),
    experience: cv.experience.map((job) => ({
      ...job,
      bullets: job.bullets.map((b) => b.trim()).filter(Boolean),
    })),
  };
}

export function extractJsonObject(text: string): unknown | null {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1].trim() : trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}
