import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${site.name} Career Development.`,
};

const sections = [
  {
    title: "1. Who we are",
    body: `${site.name} Career Development (“we”, “us”) provides CV / résumé and career support services. Contact: ${site.email}.`,
  },
  {
    title: "2. Information we collect",
    body: "When you submit a checkout or enquiry we may collect your name, surname, email, WhatsApp number, location, country, package preference, CV colour choice, messages, and uploaded files (CV and optional picture).",
  },
  {
    title: "3. How we use information",
    body: "We use your information to process orders, prepare documents, communicate about quotes and payment, deliver package inclusions (including recruiter-related services where applicable), improve our services, and respond to Canada relocation questions via our assistant.",
  },
  {
    title: "4. File uploads",
    body: "Uploaded CVs and pictures are stored securely for order fulfilment (for example via email to our team and, when configured, cloud object storage). We retain files only as long as needed for the service and legitimate business records, unless a longer period is required by law.",
  },
  {
    title: "5. Sharing",
    body: "We may share relevant information with service providers who help us operate (email delivery, hosting, storage) and, where your package includes outreach, with recruiters or hiring managers for your career search. We do not sell your personal information.",
  },
  {
    title: "6. Chat assistant",
    body: "Messages sent to our Canada relocation chat may be processed by AI providers to generate responses. Do not share passwords, banking PINs, or unnecessary identity document numbers in chat.",
  },
  {
    title: "7. Your choices",
    body: `You may request access, correction, or deletion of personal information we hold, subject to legal exceptions, by emailing ${site.email}.`,
  },
  {
    title: "8. Security",
    body: "We take reasonable technical and organisational measures to protect personal information. No method of transmission or storage is completely secure.",
  },
  {
    title: "9. Updates",
    body: "We may update this Privacy Policy from time to time. The latest version will be posted on this page.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-cream">
      <section className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <p className="section-label">Legal</p>
        <h1 className="mt-3 text-3xl text-ink sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted">
          Last updated{" "}
          {new Date().toLocaleDateString("en-ZA", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          .
        </p>
        <div className="maple-divider mt-5" />
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xl text-ink">{section.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                {section.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-12 text-sm font-semibold text-ink">{site.signature}</p>
        <p className="mt-6 text-sm text-muted">
          See also our{" "}
          <Link href="/terms" className="font-semibold text-teal underline">
            Terms &amp; Conditions
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
