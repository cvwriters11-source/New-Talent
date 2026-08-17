"use client";

import { FormEvent, useMemo, useState } from "react";
import { PredictiveTextField } from "@/components/PredictiveTextField";
import { SamuelCvTemplate } from "@/components/resume/SamuelCvTemplate";
import {
  emptyResumeCv,
  type ResumeCv,
  type ResumeEducation,
  type ResumeExperience,
  type ResumeListedItem,
} from "@/lib/resume/schema";
import {
  headlinePredictions,
  jobLocationPredictions,
  languagePredictions,
  linkedinPredictions,
  locationPredictions,
  skillPredictions,
} from "@/lib/resume/predictions";

type Step = "source" | "edit" | "preview";

const fieldClass =
  "w-full rounded-md border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-teal";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted";

function linesToList(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function listToLines(value: string[]) {
  return value.join("\n");
}

export function ResumeGeneratorWizard({
  mode = "public",
}: {
  mode?: "public" | "admin";
}) {
  const [step, setStep] = useState<Step>("source");
  const [cv, setCv] = useState<ResumeCv>(emptyResumeCv);
  const [busy, setBusy] = useState<"parse" | "rewrite" | "pdf" | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [languageDraft, setLanguageDraft] = useState("");
  const [skillDraft, setSkillDraft] = useState("");

  const canEdit = useMemo(() => Boolean(cv.fullName.trim()), [cv.fullName]);
  const headlineOptions = useMemo(
    () => headlinePredictions(cv.headline),
    [cv.headline],
  );
  const locationOptions = useMemo(
    () => locationPredictions(cv.location),
    [cv.location],
  );
  const linkedinOptions = useMemo(
    () => linkedinPredictions(cv.linkedin, cv.fullName),
    [cv.linkedin, cv.fullName],
  );
  const languageOptions = useMemo(
    () => languagePredictions(languageDraft, cv.languages),
    [languageDraft, cv.languages],
  );
  const skillOptions = useMemo(
    () => skillPredictions(skillDraft, cv.skills),
    [skillDraft, cv.skills],
  );

  function update<K extends keyof ResumeCv>(key: K, value: ResumeCv[K]) {
    setCv((prev) => ({ ...prev, [key]: value }));
  }

  function appendUnique(list: string[], value: string) {
    const next = value.trim();
    if (!next) return list;
    if (list.some((item) => item.toLowerCase() === next.toLowerCase())) {
      return list;
    }
    return [...list, next];
  }

  async function onUpload(file: File | null) {
    if (!file) return;
    setError("");
    setInfo("");
    setBusy("parse");
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/resume/parse", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Parse failed");
      setCv(data.cv as ResumeCv);
      setStep("edit");
      setInfo("CV extracted. Review the details, then rewrite with ChatGPT.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not parse this file.");
    } finally {
      setBusy(null);
    }
  }

  async function onPasteParse(e: FormEvent) {
    e.preventDefault();
    if (!pasteText.trim()) {
      setError("Paste your CV text first.");
      return;
    }
    setError("");
    setBusy("parse");
    try {
      const res = await fetch("/api/resume/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Parse failed");
      setCv(data.cv as ResumeCv);
      setStep("edit");
      setInfo("Text parsed. Review details, then rewrite with ChatGPT.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not parse this text.");
    } finally {
      setBusy(null);
    }
  }

  function startBlank() {
    setCv(emptyResumeCv());
    setError("");
    setInfo("Fill in your details below.");
    setStep("edit");
  }

  async function onRewrite() {
    setError("");
    setBusy("rewrite");
    try {
      const res = await fetch("/api/resume/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rewrite failed");
      setCv(data.cv as ResumeCv);
      setStep("preview");
      setInfo("Rewritten with ChatGPT using the Samuel template layout.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rewrite failed.");
    } finally {
      setBusy(null);
    }
  }

  async function onDownloadPdf() {
    setError("");
    setBusy("pdf");
    try {
      const res = await fetch("/api/resume/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "PDF failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cv.fullName.replace(/\s+/g, "_") || "CV"}_Talent_Crafters.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download PDF.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 text-sm font-semibold">
        {(
          [
            ["source", "1. Source"],
            ["edit", "2. Edit"],
            ["preview", "3. Preview"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              if (id === "edit" && !canEdit && step === "source") return;
              setStep(id);
            }}
            className={`rounded-md px-3 py-2 ${
              step === id
                ? "bg-teal text-navy"
                : "border border-line bg-paper text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="rounded-md border border-line bg-cream px-3 py-2 text-sm text-muted">
          {info}
        </p>
      ) : null}

      {step === "source" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-line bg-paper p-5 shadow-sm">
            <h2 className="text-base font-bold text-ink">Upload existing CV</h2>
            <p className="mt-1 text-sm text-muted">
              PDF preferred. We extract text, then rewrite into the Samuel
              Parirenyatwa template.
            </p>
            <label className="mt-4 block">
              <span className={labelClass}>CV file</span>
              <input
                type="file"
                accept=".pdf,.txt,.md,application/pdf,text/plain"
                disabled={busy !== null}
                className={fieldClass}
                onChange={(e) => void onUpload(e.target.files?.[0] || null)}
              />
            </label>
            {busy === "parse" ? (
              <p className="mt-3 text-sm text-muted">Reading CV…</p>
            ) : null}
          </section>

          <section className="rounded-xl border border-line bg-paper p-5 shadow-sm">
            <h2 className="text-base font-bold text-ink">Or start fresh / paste</h2>
            <button
              type="button"
              onClick={startBlank}
              className="mt-3 inline-flex btn-primary px-4 py-2.5 text-sm"
            >
              Fill form from scratch
            </button>
            <form onSubmit={onPasteParse} className="mt-5 space-y-3">
              <label className="block">
                <span className={labelClass}>Paste CV text</span>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  rows={8}
                  className={fieldClass}
                  placeholder="Paste your full CV text here…"
                />
              </label>
              <button
                type="submit"
                disabled={busy !== null}
                className="inline-flex btn-primary px-4 py-2.5 text-sm disabled:opacity-60"
              >
                {busy === "parse" ? "Parsing…" : "Parse pasted text"}
              </button>
            </form>
          </section>
        </div>
      ) : null}

      {step === "edit" ? (
        <div className="space-y-5 rounded-xl border border-line bg-paper p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Full name</span>
              <input
                className={fieldClass}
                value={cv.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                autoComplete="name"
              />
            </label>
            <PredictiveTextField
              id="resume-headline"
              name="headline"
              label="Headline / title"
              className={fieldClass}
              labelClassName={labelClass}
              value={cv.headline}
              onValueChange={(value) => update("headline", value)}
              predictions={headlineOptions}
              placeholder="Start typing a job title…"
              emptyHint="No match yet — type your own headline."
            />
            <label className="block">
              <span className={labelClass}>Phone</span>
              <input
                className={fieldClass}
                value={cv.phone}
                onChange={(e) => update("phone", e.target.value)}
                autoComplete="tel"
              />
            </label>
            <label className="block">
              <span className={labelClass}>Email</span>
              <input
                className={fieldClass}
                type="email"
                value={cv.email}
                onChange={(e) => update("email", e.target.value)}
                autoComplete="email"
              />
            </label>
            <PredictiveTextField
              id="resume-location"
              name="location"
              label="Location"
              className={fieldClass}
              labelClassName={labelClass}
              value={cv.location}
              onValueChange={(value) => update("location", value)}
              predictions={locationOptions}
              placeholder="Start typing a city…"
              emptyHint="No match yet — type City, Country."
            />
            <PredictiveTextField
              id="resume-linkedin"
              name="linkedin"
              label="LinkedIn"
              className={fieldClass}
              labelClassName={labelClass}
              value={cv.linkedin}
              onValueChange={(value) => update("linkedin", value)}
              predictions={linkedinOptions}
              placeholder="https://www.linkedin.com/in/…"
              emptyHint="Type your LinkedIn URL or pick the name-based suggestion."
            />
          </div>

          <div className="space-y-2">
            <PredictiveTextField
              id="resume-language-add"
              name="languageAdd"
              label="Languages"
              className={fieldClass}
              labelClassName={labelClass}
              value={languageDraft}
              onValueChange={setLanguageDraft}
              onSelectPrediction={(item) => {
                update("languages", appendUnique(cv.languages, item.value));
                setLanguageDraft("");
              }}
              predictions={languageOptions}
              placeholder="Add a language…"
              emptyHint="Type a language, then pick a suggestion."
            />
            <textarea
              className={fieldClass}
              rows={2}
              value={listToLines(cv.languages)}
              onChange={(e) => update("languages", linesToList(e.target.value))}
              placeholder="English, Setswana, Zulu…"
            />
          </div>

          <label className="block">
            <span className={labelClass}>Personal summary</span>
            <textarea
              className={fieldClass}
              rows={5}
              value={cv.summary}
              onChange={(e) => update("summary", e.target.value)}
            />
          </label>

          <div className="space-y-2">
            <PredictiveTextField
              id="resume-skill-add"
              name="skillAdd"
              label="Key skills"
              className={fieldClass}
              labelClassName={labelClass}
              value={skillDraft}
              onValueChange={setSkillDraft}
              onSelectPrediction={(item) => {
                update("skills", appendUnique(cv.skills, item.value));
                setSkillDraft("");
              }}
              predictions={skillOptions}
              placeholder="Add a skill…"
              emptyHint="Type a skill, then pick a suggestion."
            />
            <textarea
              className={fieldClass}
              rows={6}
              value={listToLines(cv.skills)}
              onChange={(e) => update("skills", linesToList(e.target.value))}
              placeholder="One skill per line"
            />
          </div>

          <ExperienceEditor
            value={cv.experience}
            onChange={(experience) => update("experience", experience)}
          />
          <EducationEditor
            value={cv.education}
            onChange={(education) => update("education", education)}
          />
          <ListedEditor
            title="Professional affiliations"
            value={cv.affiliations}
            onChange={(affiliations) => update("affiliations", affiliations)}
          />
          <ListedEditor
            title="Professional development"
            value={cv.professionalDevelopment}
            onChange={(professionalDevelopment) =>
              update("professionalDevelopment", professionalDevelopment)
            }
          />
          <ListedEditor
            title="Awards"
            value={cv.awards}
            onChange={(awards) => update("awards", awards)}
          />

          <label className="block">
            <span className={labelClass}>References note</span>
            <input
              className={fieldClass}
              value={cv.referencesNote}
              onChange={(e) => update("referencesNote", e.target.value)}
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep("source")}
              className="rounded-md border border-line px-4 py-2.5 text-sm font-semibold"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!canEdit || busy !== null}
              onClick={() => void onRewrite()}
              className="inline-flex btn-primary px-4 py-2.5 text-sm disabled:opacity-60"
            >
              {busy === "rewrite" ? "Rewriting…" : "CREATIVE-CV REWRITE"}
            </button>
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => setStep("preview")}
              className="rounded-md border border-teal px-4 py-2.5 text-sm font-semibold text-teal"
            >
              Skip to preview
            </button>
          </div>
        </div>
      ) : null}

      {step === "preview" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep("edit")}
              className="rounded-md border border-line px-4 py-2.5 text-sm font-semibold"
            >
              Edit details
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void onRewrite()}
              className="rounded-md border border-teal px-4 py-2.5 text-sm font-semibold text-teal disabled:opacity-60"
            >
              {busy === "rewrite" ? "Rewriting…" : "CREATIVE-CV REWRITE"}
            </button>
            <button
              type="button"
              disabled={busy !== null || !canEdit}
              onClick={() => void onDownloadPdf()}
              className="inline-flex btn-primary px-4 py-2.5 text-sm disabled:opacity-60"
            >
              {busy === "pdf" ? "Preparing PDF…" : "Download PDF"}
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-line bg-[#e8eaed] p-3 shadow-sm sm:p-4">
            <div className="resume-preview-scale mx-auto w-fit">
              <SamuelCvTemplate
                cv={cv}
                className="mx-auto shadow-lg ring-1 ring-black/10"
              />
            </div>
          </div>
          {mode === "admin" ? (
            <p className="text-xs text-muted">
              Admin tip: download the PDF and attach it to the client order, or
              share with the assigned writer.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ExperienceEditor({
  value,
  onChange,
}: {
  value: ResumeExperience[];
  onChange: (value: ResumeExperience[]) => void;
}) {
  function updateRow(index: number, patch: Partial<ResumeExperience>) {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-ink">Professional experience</h3>
        <button
          type="button"
          className="text-sm font-semibold text-teal"
          onClick={() =>
            onChange([
              ...value,
              {
                company: "",
                location: "",
                title: "",
                startDate: "",
                endDate: "",
                intro: "",
                bullets: [],
              },
            ])
          }
        >
          + Add role
        </button>
      </div>
      {value.map((job, index) => (
        <div
          key={index}
          className="space-y-2 rounded-md border border-line bg-cream/40 p-3"
        >
          <div className="grid gap-2 md:grid-cols-2">
            <input
              className={fieldClass}
              placeholder="Company"
              value={job.company}
              onChange={(e) => updateRow(index, { company: e.target.value })}
            />
            <PredictiveTextField
              id={`resume-job-location-${index}`}
              name={`jobLocation-${index}`}
              label="Location"
              className={fieldClass}
              labelClassName="sr-only"
              value={job.location}
              onValueChange={(next) => updateRow(index, { location: next })}
              predictions={jobLocationPredictions(job.location)}
              placeholder="City, Country"
              emptyHint="Type a city or country."
            />
            <PredictiveTextField
              id={`resume-job-title-${index}`}
              name={`jobTitle-${index}`}
              label="Title"
              className={fieldClass}
              labelClassName="sr-only"
              value={job.title}
              onValueChange={(next) => updateRow(index, { title: next })}
              predictions={headlinePredictions(job.title)}
              placeholder="Role title"
              emptyHint="Type your role title."
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className={fieldClass}
                placeholder="Start"
                value={job.startDate}
                onChange={(e) => updateRow(index, { startDate: e.target.value })}
              />
              <input
                className={fieldClass}
                placeholder="End"
                value={job.endDate}
                onChange={(e) => updateRow(index, { endDate: e.target.value })}
              />
            </div>
          </div>
          <textarea
            className={fieldClass}
            rows={2}
            placeholder="Intro sentence (optional)"
            value={job.intro}
            onChange={(e) => updateRow(index, { intro: e.target.value })}
          />
          <textarea
            className={fieldClass}
            rows={4}
            placeholder="Bullets (one per line)"
            value={listToLines(job.bullets)}
            onChange={(e) =>
              updateRow(index, { bullets: linesToList(e.target.value) })
            }
          />
          <button
            type="button"
            className="text-xs font-semibold text-danger"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            Remove role
          </button>
        </div>
      ))}
    </div>
  );
}

function EducationEditor({
  value,
  onChange,
}: {
  value: ResumeEducation[];
  onChange: (value: ResumeEducation[]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-ink">Education</h3>
        <button
          type="button"
          className="text-sm font-semibold text-teal"
          onClick={() =>
            onChange([...value, { degree: "", institution: "", year: "" }])
          }
        >
          + Add education
        </button>
      </div>
      {value.map((ed, index) => (
        <div key={index} className="grid gap-2 md:grid-cols-3">
          <input
            className={fieldClass}
            placeholder="Degree"
            value={ed.degree}
            onChange={(e) =>
              onChange(
                value.map((row, i) =>
                  i === index ? { ...row, degree: e.target.value } : row,
                ),
              )
            }
          />
          <input
            className={fieldClass}
            placeholder="Institution"
            value={ed.institution}
            onChange={(e) =>
              onChange(
                value.map((row, i) =>
                  i === index ? { ...row, institution: e.target.value } : row,
                ),
              )
            }
          />
          <div className="flex gap-2">
            <input
              className={fieldClass}
              placeholder="Year"
              value={ed.year}
              onChange={(e) =>
                onChange(
                  value.map((row, i) =>
                    i === index ? { ...row, year: e.target.value } : row,
                  ),
                )
              }
            />
            <button
              type="button"
              className="shrink-0 text-xs font-semibold text-danger"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ListedEditor({
  title,
  value,
  onChange,
}: {
  title: string;
  value: ResumeListedItem[];
  onChange: (value: ResumeListedItem[]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        <button
          type="button"
          className="text-sm font-semibold text-teal"
          onClick={() =>
            onChange([...value, { title: "", detail: "", year: "" }])
          }
        >
          + Add
        </button>
      </div>
      {value.map((item, index) => (
        <div key={index} className="grid gap-2 md:grid-cols-3">
          <input
            className={fieldClass}
            placeholder="Title"
            value={item.title}
            onChange={(e) =>
              onChange(
                value.map((row, i) =>
                  i === index ? { ...row, title: e.target.value } : row,
                ),
              )
            }
          />
          <input
            className={fieldClass}
            placeholder="Detail / org"
            value={item.detail}
            onChange={(e) =>
              onChange(
                value.map((row, i) =>
                  i === index ? { ...row, detail: e.target.value } : row,
                ),
              )
            }
          />
          <div className="flex gap-2">
            <input
              className={fieldClass}
              placeholder="Year"
              value={item.year}
              onChange={(e) =>
                onChange(
                  value.map((row, i) =>
                    i === index ? { ...row, year: e.target.value } : row,
                  ),
                )
              }
            />
            <button
              type="button"
              className="shrink-0 text-xs font-semibold text-danger"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
