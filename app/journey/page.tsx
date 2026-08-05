import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Your Career Journey",
  description:
    "How Talent Crafters guides your career journey — Graduate, Professional, Executive, and International Resume packages.",
};

const steps = [
  {
    title: "Clarify your direction",
    body: "We start with where you are and where you want to go — local growth, a role change, or an international move.",
  },
  {
    title: "Strengthen how you show up",
    body: "Choose Graduate, Professional, or Executive packaging so your CV matches your experience level and the roles you want.",
  },
  {
    title: "Go global when ready",
    body: "The International Resume package adapts your document for overseas markets — structure, length, and presentation standards.",
  },
  {
    title: "Checkout and move forward",
    body: "Open a package, review what’s included, then proceed to checkout with your details and CV. We’ll confirm your quote and payment steps.",
  },
  {
    title: "Explore Canada when ready",
    body: "Use our Canada relocation chat for IRCC-based guidance on Express Entry, work and study permits, and visitor pathways — always verify on the official IRCC site.",
  },
];

export default function JourneyPage() {
  return (
    <div className="bg-cream">
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <SectionHeading
          eyebrow="Journey"
          title="A clear path from where you are to where you want to work."
          description="Career Development with Talent Crafters is sequential when you need it — and modular when you only need one piece."
        />

        <ol className="mt-14 grid gap-8 md:grid-cols-2">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="border border-line bg-paper p-6 shadow-sm"
            >
              <span className="text-3xl font-bold text-teal/30">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="mt-3 text-xl text-ink">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/packages" className="px-6 py-3.5">
            Browse packages
          </ButtonLink>
          <ButtonLink
            href="/contact"
            variant="secondary"
            className="px-6 py-3.5"
          >
            Contact us
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
