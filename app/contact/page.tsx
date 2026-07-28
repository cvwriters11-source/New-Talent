import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionHeading } from "@/components/SectionHeading";
import { site } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Talent Crafters Career Development via email, WhatsApp, or the enquiry form.",
};

export default function ContactPage() {
  return (
    <div className="bg-cream">
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <SectionHeading
          eyebrow="Contact"
          title="Let’s talk about your next step."
          description="Reach us by WhatsApp or email — or send a structured enquiry and we’ll come back with clear next steps."
        />

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          <div className="border border-line bg-paper p-7">
            <h2 className="text-xl text-ink">Email</h2>
            <a
              href={`mailto:${site.email}`}
              className="mt-3 block text-sm font-semibold text-teal hover:text-teal-bright"
            >
              {site.email}
            </a>
          </div>
          <div className="border border-line bg-paper p-7">
            <h2 className="text-xl text-ink">WhatsApp</h2>
            <p className="mt-3 text-sm text-muted">
              Fast for quick questions and package interest.
            </p>
            <div className="mt-5">
              <ButtonLink
                href={whatsappLink(
                  "Hi Talent Crafters — I'd like to talk about Career Development packages.",
                )}
                external
              >
                Open WhatsApp
              </ButtonLink>
            </div>
          </div>
          <div className="border border-line bg-paper p-7">
            <h2 className="text-xl text-ink">Location</h2>
            <p className="mt-3 text-sm text-muted">{site.location}</p>
            <div className="mt-5">
              <ButtonLink href="/packages" variant="secondary">
                View packages
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
