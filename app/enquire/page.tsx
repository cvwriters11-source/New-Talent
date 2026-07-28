import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Enquire",
  description:
    "Start a Career Development package checkout with Talent Crafters.",
};

export default function EnquirePage() {
  return (
    <div className="bg-cream">
      <section className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-20">
        <SectionHeading
          eyebrow="Checkout"
          title="Choose a package to continue."
          description="Package pages show everything included. Proceed to checkout to share your details, upload your CV, and we’ll confirm payment steps."
        />
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/packages" className="px-6 py-3.5">
            View packages
          </ButtonLink>
          <ButtonLink href="/templates" variant="secondary" className="px-6 py-3.5">
            Browse templates
          </ButtonLink>
        </div>
        <p className="mt-6 text-sm text-muted">
          Prefer the old enquiry form?{" "}
          <Link href="/contact" className="font-semibold text-teal underline">
            Contact us
          </Link>{" "}
          or WhatsApp from the footer.
        </p>
      </section>
    </div>
  );
}
