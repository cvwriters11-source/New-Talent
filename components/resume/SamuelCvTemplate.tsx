import type { ReactNode } from "react";
import { normalizeResumeCv, type ResumeCv } from "@/lib/resume/schema";
import { ensureStructuredExperience } from "@/lib/resume/structure";

function splitSkills(skills: string[]) {
  const mid = Math.ceil(skills.length / 2);
  return [skills.slice(0, mid), skills.slice(mid)];
}

function renderInlineBold(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function listedLine(item: {
  title: string;
  detail?: string;
  year?: string;
}) {
  return [item.title, item.detail, item.year].filter(Boolean).join(" | ");
}

/**
 * Pixel-faithful Samuel Parirenyatwa template layout (A4, black/white, centered headers).
 */
export function SamuelCvTemplate({
  cv,
  className = "",
}: {
  cv: ResumeCv;
  className?: string;
}) {
  cv = ensureStructuredExperience(normalizeResumeCv(cv));
  const [skillsLeft, skillsRight] = splitSkills(cv.skills);
  const contact = [cv.phone, cv.email, cv.location, cv.linkedin]
    .filter(Boolean)
    .join(" | ");
  const languages = cv.languages.filter(Boolean).join(" | ");

  return (
    <article
      className={`samuel-cv bg-white text-black ${className}`}
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "12mm 11mm 14mm",
        fontFamily: "Calibri, Candara, Segoe UI, Arial, sans-serif",
        fontSize: "10pt",
        lineHeight: 1.3,
        color: "#111",
        boxSizing: "border-box",
      }}
    >
      <header className="text-center">
        <h1
          className="m-0 font-bold uppercase tracking-wide"
          style={{ fontSize: "18pt", letterSpacing: "0.02em" }}
        >
          {cv.fullName || "YOUR NAME"}
        </h1>
        {cv.headline ? (
          <p
            className="m-0 mt-1 font-bold uppercase"
            style={{ fontSize: "10.5pt" }}
          >
            {cv.headline}
          </p>
        ) : null}
        {contact ? (
          <p className="m-0 mt-2" style={{ fontSize: "9.5pt" }}>
            {contact}
          </p>
        ) : null}
        {languages ? (
          <p className="m-0 mt-1" style={{ fontSize: "9.5pt" }}>
            {languages}
          </p>
        ) : null}
        <hr
          className="mx-0 mt-3 border-0 border-t border-black"
          style={{ borderTopWidth: 1 }}
        />
      </header>

      {cv.summary ? (
        <section className="mt-3">
          <h2
            className="m-0 text-center font-bold uppercase underline"
            style={{ fontSize: "11pt" }}
          >
            Personal Summary
          </h2>
          <p className="mt-2 text-justify" style={{ fontSize: "10pt" }}>
            {renderInlineBold(cv.summary)}
          </p>
        </section>
      ) : null}

      {cv.education.length > 0 ? (
        <section className="mt-3">
          <h2
            className="m-0 text-center font-bold underline"
            style={{ fontSize: "11pt" }}
          >
            Education
          </h2>
          <div className="mt-2 space-y-1 text-center" style={{ fontSize: "10pt" }}>
            {cv.education.map((ed, i) => (
              <p key={`${ed.degree}-${i}`} className="m-0">
                <strong>{ed.degree}</strong>
                {ed.institution ? ` | ${ed.institution}` : ""}
                {ed.year ? ` | ${ed.year}` : ""}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {cv.skills.length > 0 ? (
        <section className="mt-3">
          <h2
            className="m-0 text-center font-bold underline"
            style={{ fontSize: "11pt" }}
          >
            Key Skills
          </h2>
          <div
            className="mt-2 grid grid-cols-2 gap-x-8"
            style={{ fontSize: "10pt" }}
          >
            <ul className="m-0 list-disc space-y-0.5 pl-5">
              {skillsLeft.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
            <ul className="m-0 list-disc space-y-0.5 pl-5">
              {skillsRight.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {cv.experience.length > 0 ? (
        <section className="mt-3">
          <h2
            className="m-0 text-center font-bold underline"
            style={{ fontSize: "11pt" }}
          >
            Professional Experience
          </h2>
          <div className="mt-2 space-y-3">
            {cv.experience.map((job, i) => (
              <div key={`${job.company}-${job.title}-${i}`}>
                <div
                  className="flex flex-wrap items-baseline justify-between gap-x-3"
                  style={{ fontSize: "10pt" }}
                >
                  <p className="m-0">
                    <strong>{job.company}</strong>
                    {job.location ? ` | ${job.location}` : ""}
                  </p>
                  <p className="m-0 whitespace-nowrap font-semibold">
                    {[job.startDate, job.endDate].filter(Boolean).join(" – ")}
                  </p>
                </div>
                <p className="m-0 mt-0.5 font-bold" style={{ fontSize: "10pt" }}>
                  {job.title}
                </p>
                {job.intro ? (
                  <p className="m-0 mt-1" style={{ fontSize: "10pt" }}>
                    {job.intro}
                  </p>
                ) : null}
                {job.bullets.length > 0 ? (
                  <ul
                    className="m-0 mt-1 list-disc space-y-0.5 pl-5"
                    style={{ fontSize: "10pt" }}
                  >
                    {job.bullets.map((bullet, bi) => (
                      <li key={bi}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {cv.affiliations.length > 0 ? (
        <section className="mt-3">
          <h2
            className="m-0 text-center font-bold underline"
            style={{ fontSize: "11pt" }}
          >
            Professional Affiliations
          </h2>
          <div className="mt-2 space-y-1 text-center" style={{ fontSize: "10pt" }}>
            {cv.affiliations.map((item, i) => (
              <p key={i} className="m-0">
                {listedLine(item)}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {cv.professionalDevelopment.length > 0 ? (
        <section className="mt-3">
          <h2
            className="m-0 text-center font-bold underline"
            style={{ fontSize: "11pt" }}
          >
            Professional Development
          </h2>
          <div className="mt-2 space-y-1 text-center" style={{ fontSize: "10pt" }}>
            {cv.professionalDevelopment.map((item, i) => (
              <p key={i} className="m-0">
                {listedLine(item)}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {cv.awards.length > 0 ? (
        <section className="mt-3">
          <h2
            className="m-0 text-center font-bold underline"
            style={{ fontSize: "11pt" }}
          >
            Awards and Accomplishments
          </h2>
          <div className="mt-2 space-y-1 text-center" style={{ fontSize: "10pt" }}>
            {cv.awards.map((item, i) => (
              <p key={i} className="m-0">
                {listedLine(item)}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {cv.referencesNote ? (
        <section className="mt-3">
          <h2
            className="m-0 text-center font-bold uppercase underline"
            style={{ fontSize: "11pt" }}
          >
            References
          </h2>
          <p className="mt-2 text-center" style={{ fontSize: "10pt" }}>
            • {cv.referencesNote}
          </p>
        </section>
      ) : null}
    </article>
  );
}
