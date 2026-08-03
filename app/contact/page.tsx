import type { Metadata } from "next";
import { ContactQuoteHub } from "@/components/ContactQuoteHub";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Request a quote from Talent Crafters Career Development via packages, telephone, WhatsApp, email, or visit.",
};

export default function ContactPage() {
  return (
    <div className="relative min-h-[calc(100svh-5rem)] overflow-hidden bg-[#eef2f7]">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 18%, rgba(200,16,46,0.06), transparent 42%), radial-gradient(circle at 80% 80%, rgba(11,31,58,0.08), transparent 40%), radial-gradient(circle at 15% 70%, rgba(11,31,58,0.05), transparent 35%)",
        }}
      />
      <section className="relative mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16 lg:py-20">
        <ContactQuoteHub />
      </section>
    </div>
  );
}
