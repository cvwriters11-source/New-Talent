import type { Metadata } from "next";
import { ContactQuoteHub } from "@/components/ContactQuoteHub";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Request a quote from Talent Crafters Career Development via packages, telephone, WhatsApp, email, or visit.",
};

export default function ContactPage() {
  return (
    <div className="relative min-h-[calc(100svh-5rem)] overflow-hidden bg-navy">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 28%, rgba(0,163,255,0.22), transparent 52%), radial-gradient(circle at 80% 80%, rgba(0,163,255,0.08), transparent 40%)",
        }}
      />
      <section className="relative mx-auto max-w-6xl px-3 py-8 sm:px-5 sm:py-12 md:px-8 md:py-16">
        <ContactQuoteHub />
      </section>
    </div>
  );
}
