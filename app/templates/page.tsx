import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { getDisplayTemplates } from "@/components/templates/TemplateGallery";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "CV Templates",
  description:
    "Preview Talent Crafters industry-standard CV templates with colour options.",
};

export default function TemplatesPage() {
  const displayTemplates = getDisplayTemplates();

  return (
    <div className="bg-cream">
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <SectionHeading
          eyebrow="Templates"
          title="Professional CV templates built to industry standard."
          description="Every layout is structured for recruiter readability and ATS screening. Preview a design, pick a colour, and enquire for the matching package."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "ATS-aware structure",
              body: "Clear headings, scannable sections, and keyword-ready wording.",
            },
            {
              title: "Recruiter-ready hierarchy",
              body: "Layouts that help hiring teams find impact in seconds.",
            },
            {
              title: "Colour personalisation",
              body: "Choose accents that suit your industry and personal brand.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="border border-line bg-paper px-5 py-5"
            >
              <h2 className="text-lg text-ink">{item.title}</h2>
              <p className="mt-2 text-sm text-muted">{item.body}</p>
            </div>
          ))}
        </div>

        <div
          className={`mt-14 grid gap-8 ${
            displayTemplates.length > 1 ? "lg:grid-cols-2" : "max-w-xl"
          }`}
        >
          {displayTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>

        <div className="mt-14 border border-line bg-paper px-8 py-12 shadow-sm md:px-12">
          <p className="section-label">Next step</p>
          <h2 className="mt-3 text-3xl text-ink">
            Like a template? Choose the matching package
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            We’ll write your documents in the selected layout and colour —
            including LinkedIn and email support on packages that include them.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/packages" className="px-6 py-3.5">
              View packages
            </ButtonLink>
            <ButtonLink
              href="/templates"
              variant="secondary"
              className="px-6 py-3.5"
            >
              Browse templates
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
