import type { Metadata } from "next";
import { ResumeGeneratorWizard } from "@/components/resume/ResumeGeneratorWizard";

export const metadata: Metadata = {
  title: "Resume Generator",
  description:
    "Upload your CV or fill in your details — Talent Crafters rewrites it with ChatGPT into our Samuel Parirenyatwa template.",
};

export default function ResumeGeneratorPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal">
        Resume Generation
      </p>
      <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">
        Rewrite your CV in our proven template
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Fill in your information or upload an existing CV. ChatGPT rewrites the
        content while keeping your facts, then we lay it out exactly like the
        Samuel Parirenyatwa Talent Crafters template — ready to download as PDF.
      </p>
      <div className="mt-8">
        <ResumeGeneratorWizard mode="public" />
      </div>
    </div>
  );
}
