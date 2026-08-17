import type { Metadata } from "next";
import { ResumeGeneratorWizard } from "@/components/resume/ResumeGeneratorWizard";

export const metadata: Metadata = { title: "CV Generator" };

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-ink">CV Generator</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Upload a client CV or fill details, rewrite with ChatGPT, and download
        a PDF in the Samuel Parirenyatwa template for delivery.
      </p>
      <div className="mt-6">
        <ResumeGeneratorWizard mode="admin" />
      </div>
    </div>
  );
}
