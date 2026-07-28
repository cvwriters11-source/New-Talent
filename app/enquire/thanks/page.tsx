import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Enquiry received",
  description: "Thanks for contacting Talent Crafters Career Development.",
};

export default function EnquireThanksPage() {
  return (
    <div className="bg-cream">
      <section className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
        <div className="border border-line bg-white px-8 py-14 shadow-sm md:px-14">
          <SectionHeading
            eyebrow="Thank you"
            title="We’ve received your enquiry."
            description="Our team will review your message and get back to you shortly with next steps and a clear quote."
          />
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/packages" className="px-6 py-3.5">
              Browse packages
            </ButtonLink>
            <ButtonLink href="/" variant="secondary" className="px-6 py-3.5">
              Back home
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
