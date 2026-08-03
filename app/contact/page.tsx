import type { Metadata } from "next";
import { ContactQuoteHub } from "@/components/ContactQuoteHub";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Request a quote from Talent Crafters Career Development via packages, telephone, WhatsApp, email, or visit.",
};

export default function ContactPage() {
  return (
    <div className="relative min-h-[calc(100svh-5rem)] overflow-hidden bg-[#f4f6f8]">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.9), transparent 55%)",
        }}
      />
      <section className="relative mx-auto max-w-6xl px-3 py-8 sm:px-5 sm:py-12 md:px-8 md:py-16">
        <ContactQuoteHub />
      </section>
    </div>
  );
}
