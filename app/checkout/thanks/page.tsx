import type { Metadata } from "next";
import { ButtonLink } from "@/components/ButtonLink";
import { getPackageBySlug } from "@/lib/admin/store";
import { site } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Order received",
  description: "Your Career Development order was submitted successfully.",
};

type Props = {
  searchParams: Promise<{ package?: string }>;
};

export default async function CheckoutThanksPage({ searchParams }: Props) {
  const { package: packageSlug } = await searchParams;
  const pkg = packageSlug ? await getPackageBySlug(packageSlug) : undefined;

  return (
    <div className="bg-cream">
      <section className="mx-auto max-w-2xl px-5 py-16 text-center md:px-8 md:py-24">
        <p className="section-label">Thank you</p>
        <h1 className="mt-3 text-3xl text-ink sm:text-4xl">
          Order received
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          {pkg
            ? `We’ve received your ${pkg.name} order.`
            : "We’ve received your Career Development order."}{" "}
          Our team will confirm your quote and send payment instructions by
          WhatsApp or email shortly.
        </p>
        <p className="mt-4 text-sm font-semibold text-ink">{site.signature}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink
            href={whatsappLink(
              pkg
                ? `Hi Talent Crafters — I just submitted a checkout for ${pkg.name}.`
                : "Hi Talent Crafters — I just submitted a checkout order.",
            )}
            className="px-6 py-3.5"
            external
          >
            Continue on WhatsApp
          </ButtonLink>
          <ButtonLink
            href="/packages"
            variant="secondary"
            className="px-6 py-3.5"
          >
            Back to packages
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
