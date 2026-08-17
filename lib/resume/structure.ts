import type { ResumeCv, ResumeExperience } from "@/lib/resume/schema";

const SECTION_HEADINGS =
  /^(?:PERSONAL\s+SUMMARY|PROFESSIONAL\s+SUMMARY|SUMMARY|PROFILE|EDUCATION|KEY\s+SKILLS|SKILLS|COMPETENCIES|PROFESSIONAL\s+EXPERIENCE|CAREER\s+HISTORY|WORK\s+HISTORY|EMPLOYMENT|EXPERIENCE|PROFESSIONAL\s+AFFILIATIONS|AFFILIATIONS|PROFESSIONAL\s+DEVELOPMENT|AWARDS(?:\s+AND\s+ACCOMPLISHMENTS)?|REFERENCES|LANGUAGES|CERTIFICATIONS)\s*:?\s*$/i;

const DATE_RANGE =
  /\b(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?(?:19|20)\d{2}\s*[-\u2013\u2014]\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?(?:(?:19|20)\d{2}|Present|Current)\b/i;

function clean(value: string) {
  return value.replace(/\s+/g, " ").replace(/^[-•*.\s]+/, "").trim();
}

function isSectionHeading(line: string) {
  return SECTION_HEADINGS.test(line.trim());
}

function isMostlyUppercase(value: string) {
  const letters = value.replace(/[^A-Za-z]/g, "");
  if (letters.length < 3) return false;
  return letters.replace(/[^A-Z]/g, "").length / letters.length >= 0.7;
}

function looksLikeCompany(line: string) {
  const value = clean(line);
  if (!value || value.length > 90 || isSectionHeading(value)) return false;
  if (DATE_RANGE.test(value) && value.replace(DATE_RANGE, "").trim().length < 3) {
    return false;
  }
  if (
    /\b(analyst|manager|director|officer|assistant|executive|consultant|specialist|leader|associate|intern)\b/i.test(
      value,
    )
  ) {
    return false;
  }
  if (
    /\b(bank|ltd|limited|inc|corp|company|group|holdings|university|school|foundation|agency|ministry)\b/i.test(
      value,
    )
  ) {
    return true;
  }
  return isMostlyUppercase(value) && value.split(/\s+/).length <= 8;
}

function looksLikeTitle(line: string) {
  const value = clean(line);
  if (!value || value.length > 90 || isSectionHeading(value) || looksLikeCompany(value)) {
    return false;
  }
  if (DATE_RANGE.test(value)) return false;
  if (/[.!?]$/.test(value) || value.length > 70) return false;
  return (
    /\b(analyst|manager|director|officer|assistant|executive|consultant|specialist|leader|associate|intern|accountant|engineer|developer)\b/i.test(
      value,
    ) || (!isMostlyUppercase(value) && /^[A-Z]/.test(value) && value.split(/\s+/).length <= 8)
  );
}

function splitDateRange(value: string) {
  const match = value.match(DATE_RANGE);
  if (!match) return { startDate: "", endDate: "", rest: value };
  const [startDate = "", endDate = ""] = match[0]
    .split(/\s*[-\u2013\u2014]\s*/)
    .map((part) => part.trim());
  return {
    startDate,
    endDate,
    rest: clean(value.replace(match[0], " ")),
  };
}

function proseToBullets(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(clean)
    .filter((part) => part.length > 20)
    .slice(0, 8);
}

function emptyJob(): ResumeExperience {
  return {
    company: "",
    location: "",
    title: "",
    startDate: "",
    endDate: "",
    intro: "",
    bullets: [],
  };
}

function finalizeJob(job: ResumeExperience): ResumeExperience | null {
  const company = clean(job.company);
  const title = clean(job.title);
  const bullets = job.bullets.map(clean).filter(Boolean);
  const intro = clean(job.intro);

  if (!company && !title && !bullets.length && !intro) return null;

  return {
    company: company || title || "Professional Experience",
    location: clean(job.location),
    title: company ? title : "",
    startDate: clean(job.startDate),
    endDate: clean(job.endDate),
    intro,
    bullets:
      bullets.length > 0
        ? bullets
        : intro
          ? proseToBullets(intro)
          : [],
  };
}

export function extractExperienceFromText(text: string): ResumeExperience[] {
  const normalized = text.replace(/\r/g, "\n");
  const sectionMatch = normalized.match(
    /(?:^|\n)\s*(?:PROFESSIONAL\s+EXPERIENCE|CAREER\s+HISTORY|WORK\s+HISTORY|EMPLOYMENT(?:\s+HISTORY)?)\b[:\s]*/i,
  );
  if (!sectionMatch || sectionMatch.index === undefined) {
    // Fallback: plain EXPERIENCE heading on its own line.
    const plain = normalized.match(/(?:^|\n)\s*EXPERIENCE\b[:\s]*/i);
    if (!plain || plain.index === undefined) return [];
    return extractExperienceFromText(
      `${normalized.slice(0, plain.index)}\nCAREER HISTORY${normalized.slice(plain.index + plain[0].length)}`,
    );
  }

  const start = sectionMatch.index + sectionMatch[0].length;
  const rest = normalized.slice(start);
  const next = rest.search(
    /\n\s*(?:EDUCATION|KEY\s+SKILLS|SKILLS|PROFESSIONAL\s+AFFILIATIONS|AFFILIATIONS|PROFESSIONAL\s+DEVELOPMENT|AWARDS|REFERENCES|LANGUAGES|CERTIFICATIONS)\b/i,
  );
  const body = (next >= 0 ? rest.slice(0, next) : rest).trim();
  if (!body) return [];

  const lines = body
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const jobs: ResumeExperience[] = [];
  let current = emptyJob();
  let bodyLines: string[] = [];

  const pushCurrent = () => {
    if (bodyLines.length) {
      const hasExplicitBullets = bodyLines.some((line) => /^[-•*]/.test(line));
      const prose = bodyLines.map(clean).filter(Boolean);

      if (hasExplicitBullets) {
        const unbulleted: string[] = [];
        for (const line of bodyLines) {
          const value = clean(line);
          if (!value) continue;
          if (/^[-•*]/.test(line)) {
            current.bullets.push(value);
          } else if (current.bullets.length) {
            const last = current.bullets.length - 1;
            current.bullets[last] = `${current.bullets[last]} ${value}`.trim();
          } else {
            unbulleted.push(value);
          }
        }
        if (unbulleted.length) current.intro = unbulleted.join(" ");
      } else if (prose.length === 1) {
        const parts = proseToBullets(prose[0]);
        if (parts.length > 1) current.bullets = parts;
        else current.intro = prose[0];
      } else if (prose.length > 1) {
        current.intro = prose[0];
        current.bullets = prose.slice(1);
      }
    }
    const finalized = finalizeJob(current);
    if (finalized) jobs.push(finalized);
    current = emptyJob();
    bodyLines = [];
  };

  for (const raw of lines) {
    if (isSectionHeading(raw)) break;
    const dated = splitDateRange(raw);
    const dateOnly = Boolean(dated.startDate && !dated.rest);

    if (looksLikeCompany(raw)) {
      if (current.company || current.title || bodyLines.length) pushCurrent();
      const datedCompany = splitDateRange(raw);
      const parts = clean(datedCompany.rest || raw).split("|").map(clean);
      current.company = parts[0] || "";
      current.location = parts[1] || "";
      current.startDate = datedCompany.startDate;
      current.endDate = datedCompany.endDate;
      continue;
    }

    if (dated.startDate) {
      current.startDate = dated.startDate;
      current.endDate = dated.endDate;
      if (dated.rest && !current.title && looksLikeTitle(dated.rest)) {
        current.title = dated.rest;
      } else if (dated.rest && !current.company && looksLikeCompany(dated.rest)) {
        current.company = dated.rest;
      } else if (dated.rest) {
        bodyLines.push(dated.rest);
      }
      continue;
    }

    if (dateOnly) continue;

    if (!current.title && looksLikeTitle(raw)) {
      current.title = clean(raw);
      continue;
    }

    bodyLines.push(raw);
  }
  pushCurrent();

  return jobs.slice(0, 8);
}

function experienceLooksBroken(jobs: ResumeExperience[]) {
  if (!jobs.length) return true;
  return jobs.every((job) => {
    const weakHeader =
      !job.company ||
      job.company === "Professional Experience" ||
      looksLikeTitle(job.company);
    const fragmentBullets = job.bullets.some(
      (bullet) =>
        /^[a-z]/.test(bullet) ||
        bullet.startsWith(".") ||
        /^(?:and|with|to|for|in|of|analysis|make|highly)\b/i.test(bullet),
    );
    return weakHeader || (!job.title && !job.startDate && fragmentBullets);
  });
}

export function ensureStructuredExperience(
  cv: ResumeCv,
  sourceText = "",
): ResumeCv {
  const fromSource = sourceText ? extractExperienceFromText(sourceText) : [];
  let experience = cv.experience;

  if ((experienceLooksBroken(experience) || experience.length < fromSource.length) && fromSource.length) {
    experience = fromSource;
  }

  if (experienceLooksBroken(experience)) {
    const salvageText = [
      cv.summary,
      ...cv.skills,
      ...cv.experience.flatMap((job) => [
        job.company,
        job.title,
        `${job.startDate} – ${job.endDate}`,
        job.intro,
        ...job.bullets,
      ]),
    ]
      .filter(Boolean)
      .join("\n");

    const careerIdx = salvageText.search(/\b(?:CAREER\s+HISTORY|PROFESSIONAL\s+EXPERIENCE|WORK\s+HISTORY)\b/i);
    if (careerIdx >= 0) {
      const recovered = extractExperienceFromText(
        `CAREER HISTORY\n${salvageText.slice(careerIdx).replace(/\b(?:CAREER\s+HISTORY|PROFESSIONAL\s+EXPERIENCE|WORK\s+HISTORY)\b/i, "")}`,
      );
      if (recovered.length) experience = recovered;
    }
  }

  experience = experience.map((job) => {
    let company = clean(job.company);
    let title = clean(job.title);
    if (looksLikeTitle(company) && !title) {
      title = company;
      company = "Professional Experience";
    }
    if (looksLikeCompany(title) && !looksLikeCompany(company)) {
      const swap = company;
      company = title;
      title = swap;
    }

    const bullets = job.bullets
      .map(clean)
      .filter(Boolean)
      .flatMap((bullet) =>
        bullet.length > 140 || /^[a-z]/.test(bullet)
          ? proseToBullets(bullet)
          : [bullet],
      );

    return {
      ...job,
      company,
      location: clean(job.location),
      title,
      startDate: clean(job.startDate),
      endDate: clean(job.endDate),
      intro: clean(job.intro),
      bullets,
    };
  });

  return {
    ...cv,
    experience: experience.filter((job) => job.company || job.title || job.bullets.length),
  };
}
