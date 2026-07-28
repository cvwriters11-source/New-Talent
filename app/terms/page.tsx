import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms & Conditions for ${site.name} Career Development services.`,
};

const serviceItems = [
  "Custom CV / résumé writing from scratch",
  "Cover letter creation",
  "LinkedIn profile optimisation",
  "Graduate, Professional, Executive, and International packages",
  "Career hunt techniques and recruiter support where included",
  "Responsive customer support via WhatsApp and email",
];

const sections: {
  title: string;
  body?: string;
  items?: string[];
  after?: string;
}[] = [
  {
    title: "1. Introduction",
    body: `Welcome to ${site.name}. These Terms and Conditions govern your use of our website and Career Development services. By accessing or using our services, you agree to be bound by these terms.`,
  },
  {
    title: "2. Services",
    body: `${site.name} provides professional CV writing, cover letter writing, LinkedIn profile optimisation, and related career support. Our services include:`,
    items: serviceItems,
    after:
      "Package inclusions, timelines, and scope are as described on each package page or as confirmed in writing for your order.",
  },
  {
    title: "3. Orders and payment",
    body: "Checkout on this website collects your details and documents so we can prepare your order. Online card payment is not completed on the checkout form. After we review your submission, we will confirm a clear quote and send payment instructions by WhatsApp or email. Work begins after payment is confirmed unless otherwise agreed in writing.",
  },
  {
    title: "4. Turnaround times",
    body: "Published turnaround times (for example 10, 7, 5, or 4 working days) start after we receive complete information, documents, and confirmed payment. Delays caused by incomplete files, late feedback, or third-party platforms are excluded.",
  },
  {
    title: "5. Revisions",
    body: "Revision rounds are included as described for your package or as confirmed in writing. Feedback should be provided promptly. If we do not receive revision feedback within a reasonable period after delivery, the order may be marked complete. Reopening a closed order may attract an additional fee.",
  },
  {
    title: "6. Recruiter database and outreach",
    body: "Where a package includes adding your email/CV to a recruiters database or submitting documents to recruiters and hiring managers, we act in good faith to support your search. We do not guarantee interviews, job offers, or placement outcomes.",
  },
  {
    title: "7. Refunds",
    body: "Refund requests must be raised in writing within two (2) days of payment and before substantive drafting work has started. Once writing, design, or optimisation work has commenced, fees are generally non-refundable except where required by law.",
  },
  {
    title: "8. Client responsibilities",
    body: "You confirm that information and documents you provide are accurate and that you have the right to share them. You are responsible for reviewing final documents before submitting them to employers.",
  },
  {
    title: "9. Data security",
    body: "We handle personal information and uploaded files carefully for the purpose of delivering your order. See our Privacy Policy for more detail.",
  },
  {
    title: "10. Intellectual property",
    body: `Final personalised CV / résumé documents prepared for you are licensed for your personal career use. Templates, processes, website content, and branding remain the property of ${site.name}.`,
  },
  {
    title: "11. Limitation of liability",
    body: "To the fullest extent permitted by law, we are not liable for indirect or consequential losses, including lost opportunities or employment outcomes. Our total liability related to an order is limited to the fees paid for that order.",
  },
  {
    title: "12. Immigration guidance disclaimer",
    body: "Any Canada relocation information provided on this website or via our chat assistant is general information based on publicly available Immigration, Refugees and Citizenship Canada (IRCC) resources. It is not legal advice. Always verify requirements on the official IRCC website before applying.",
  },
  {
    title: "13. Contact",
    body: `Questions about these terms: ${site.email} or WhatsApp via the contact details on this website.`,
  },
];

export default function TermsPage() {
  return (
    <div className="bg-cream">
      <section className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <p className="section-label">Legal</p>
        <h1 className="mt-3 text-3xl text-ink sm:text-4xl">
          Terms &amp; Conditions
        </h1>
        <p className="mt-3 text-sm text-muted">
          Last updated{" "}
          {new Date().toLocaleDateString("en-ZA", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          . {site.name} Career Development.
        </p>
        <div className="maple-divider mt-5" />
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xl text-ink">{section.title}</h2>
              {section.body ? (
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  {section.body}
                </p>
              ) : null}
              {section.items ? (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted sm:text-base">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.after ? (
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  {section.after}
                </p>
              ) : null}
            </div>
          ))}
        </div>
        <p className="mt-12 text-sm font-semibold text-ink">{site.signature}</p>
        <p className="mt-6 text-sm text-muted">
          Also read our{" "}
          <Link href="/privacy" className="font-semibold text-teal underline">
            Privacy Policy
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
