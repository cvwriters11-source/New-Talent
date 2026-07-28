import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionHeading } from "@/components/SectionHeading";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Talent Crafters Career Development — recruitment-backed guidance for CV revamping, interview coaching, and international job applications.",
};

export default function AboutPage() {
  return (
    <div className="bg-cream">
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <SectionHeading
          eyebrow="About"
          title={`${site.name} Career Development`}
          description="We help people move forward in their careers with practical packages — not generic advice."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5 text-base leading-relaxed text-muted">
            <p>
              Talent Crafters Recruitment understands what hiring teams look
              for. Our Career Development offering channels that insight into
              clear packages for job seekers — from graduate CVs to professional
              and executive documents, plus international resumes for overseas
              applications.
            </p>
            <p>
              This site is dedicated to that journey. You choose a package, send
              an enquiry, and we respond with next steps and a quote — direct,
              human, and grounded in real recruitment practice.
            </p>
            <p>
              Whether you need one service or the full path, we meet you where
              you are and help you take the next credible step.
            </p>
          </div>

          <aside className="border border-line bg-paper p-7">
            <h2 className="text-xl text-ink">Based in</h2>
            <p className="mt-3 text-sm text-muted">{site.location}</p>
            <h2 className="mt-8 text-xl text-ink">Focus</h2>
            <p className="mt-3 text-sm text-muted">
              Graduate · Professional · Executive · International Resume
            </p>
            <div className="mt-8">
              <ButtonLink href="/packages">View packages</ButtonLink>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
