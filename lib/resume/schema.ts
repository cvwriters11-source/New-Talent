import { z } from "zod";

const str = z.string().catch("");
const strList = z.array(z.string()).catch([]);

export const resumeExperienceSchema = z
  .object({
    company: str,
    location: str,
    title: str,
    startDate: str,
    endDate: str,
    intro: str,
    bullets: strList,
  })
  .catch({
    company: "",
    location: "",
    title: "",
    startDate: "",
    endDate: "",
    intro: "",
    bullets: [],
  });

export const resumeEducationSchema = z
  .object({
    degree: str,
    institution: str,
    year: str,
  })
  .catch({ degree: "", institution: "", year: "" });

export const resumeListedItemSchema = z
  .object({
    title: str,
    detail: str,
    year: str,
  })
  .catch({ title: "", detail: "", year: "" });

export const resumeCvSchema = z.object({
  fullName: str,
  headline: str,
  phone: str,
  email: str,
  location: str,
  linkedin: str,
  languages: strList,
  summary: str,
  education: z.array(resumeEducationSchema).catch([]),
  skills: strList,
  experience: z.array(resumeExperienceSchema).catch([]),
  affiliations: z.array(resumeListedItemSchema).catch([]),
  professionalDevelopment: z.array(resumeListedItemSchema).catch([]),
  awards: z.array(resumeListedItemSchema).catch([]),
  referencesNote: str,
});

export type ResumeCv = z.infer<typeof resumeCvSchema>;
export type ResumeExperience = z.infer<typeof resumeExperienceSchema>;
export type ResumeEducation = z.infer<typeof resumeEducationSchema>;
export type ResumeListedItem = z.infer<typeof resumeListedItemSchema>;

export const emptyResumeCv = (): ResumeCv => ({
  fullName: "",
  headline: "",
  phone: "",
  email: "",
  location: "",
  linkedin: "",
  languages: [],
  summary: "",
  education: [],
  skills: [],
  experience: [],
  affiliations: [],
  professionalDevelopment: [],
  awards: [],
  referencesNote: "Available on Request",
});

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").replace(/\s+\|/g, " |").trim();
}

function cleanList(values: string[]) {
  return [...new Set(values.map(cleanText).filter(Boolean))];
}

export function normalizeResumeCv(cv: ResumeCv): ResumeCv {
  let fullName = cleanText(cv.fullName);
  let headline = cleanText(cv.headline);

  const titledName = fullName.match(
    /^(?:CURRICULUM\s+VITAE|CV|RESUME)\s+(?:OF|FOR)\s+(.+?)(?:\s*[|–—]\s*(.+))?$/i,
  );
  if (titledName) {
    fullName = cleanText(titledName[1]);
    if (titledName[2]) headline = cleanText(titledName[2]);
  }

  if (headline.toLowerCase() === fullName.toLowerCase()) {
    headline = "";
  }

  let summary = cleanText(cv.summary).replace(
    /^(?:PERSONAL\s+SUMMARY|PROFESSIONAL\s+SUMMARY|PROFILE)\s*:?\s*/i,
    "",
  );
  const nextSection = summary.search(
    /(?:^|\s)(?:EDUCATION|KEY\s+SKILLS|PROFESSIONAL\s+EXPERIENCE|WORK\s+HISTORY|AFFILIATIONS|AWARDS|REFERENCES)\s*:?(?:\s|$)/i,
  );
  if (nextSection >= 0) summary = summary.slice(0, nextSection).trim();

  return {
    ...cv,
    fullName,
    headline,
    phone: cleanText(cv.phone),
    email: cleanText(cv.email),
    location: cleanText(cv.location),
    linkedin: cleanText(cv.linkedin),
    languages: cleanList(cv.languages),
    summary,
    education: cv.education
      .map((item) => {
        const year = cleanText(item.year);
        const institution = cleanText(item.institution).replace(
          year ? new RegExp(`\\s*[|,]?\\s*${year.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) : /$^/,
          "",
        );
        return {
          degree: cleanText(item.degree),
          institution,
          year,
        };
      })
      .filter((item) => item.degree || item.institution),
    skills: cleanList(cv.skills).filter(
      (skill) =>
        skill.length <= 48 &&
        !/^[a-z]/.test(skill) &&
        !/^(?:KEY\s+SKILLS|SKILLS|EDUCATION|PROFESSIONAL\s+EXPERIENCE|CAREER\s+HISTORY)$/i.test(
          skill,
        ),
    ),
    experience: cv.experience
      .map((job) => ({
        company: cleanText(job.company),
        location: cleanText(job.location),
        title: cleanText(job.title),
        startDate: cleanText(job.startDate),
        endDate: cleanText(job.endDate),
        intro: cleanText(job.intro),
        bullets: cleanList(job.bullets),
      }))
      .filter((job) => job.company || job.title || job.bullets.length),
    affiliations: cv.affiliations.map((item) => ({
      title: cleanText(item.title),
      detail: cleanText(item.detail),
      year: cleanText(item.year),
    })),
    professionalDevelopment: cv.professionalDevelopment.map((item) => ({
      title: cleanText(item.title),
      detail: cleanText(item.detail),
      year: cleanText(item.year),
    })),
    awards: cv.awards.map((item) => ({
      title: cleanText(item.title),
      detail: cleanText(item.detail),
      year: cleanText(item.year),
    })),
    referencesNote:
      cleanText(cv.referencesNote) || "Available on Request",
  };
}

export function parseResumeCv(raw: unknown): ResumeCv {
  const parsed = resumeCvSchema.safeParse(raw);
  if (parsed.success) {
    return normalizeResumeCv(parsed.data);
  }
  return emptyResumeCv();
}
