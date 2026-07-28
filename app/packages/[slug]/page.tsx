import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ButtonLink";
import { PackageTemplateSection } from "@/components/templates/PackageTemplateSection";
import { getPackageBySlug, listPackages } from "@/lib/admin/store";
import {
  formatLocalizedAmount,
  getGeoPricing,
} from "@/lib/geo-pricing";
import { defaultPackages } from "@/lib/packages";
import { packageWhatsappMessage, whatsappLink } from "@/lib/whatsapp";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ color?: string }>;
};

export const dynamicParams = true;
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const packages = await listPackages({ includeInactive: true });
    return packages.map((pkg) => ({ slug: pkg.slug }));
  } catch {
    return defaultPackages.map((pkg) => ({ slug: pkg.slug }));
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) return { title: "Package" };
  return {
    title: pkg.name,
    description: pkg.summary,
  };
}

export default async function PackageDetailPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const { color } = await searchParams;
  const [pkg, pricing] = await Promise.all([
    getPackageBySlug(slug),
    getGeoPricing(),
  ]);
  if (!pkg) notFound();

  const local = formatLocalizedAmount(pkg.quoteAmount, pricing.currency);

  const checkoutHref = color
    ? `/packages/${pkg.slug}/checkout?color=${encodeURIComponent(color)}`
    : `/packages/${pkg.slug}/checkout`;

  return (
    <div className="bg-cream">
      <section className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <p className="section-label">Career Development package</p>
        <h1 className="mt-3 max-w-3xl text-3xl text-ink sm:text-4xl md:text-5xl">
          {pkg.name}
        </h1>
        {pkg.subtitle ? (
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-teal">
            {pkg.subtitle}
          </p>
        ) : null}
        <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
          {pkg.tagline}
        </p>
        <p className="mt-4 text-sm font-semibold text-ink">
          {local.display}
          {pricing.isConverted
            ? ` · ~R ${Math.round(pkg.quoteAmount).toLocaleString("en-ZA")}`
            : ""}{" "}
          · {pkg.timeline}
          {pkg.region ? ` · ${pkg.region}` : ""}
        </p>
        <p className="mt-1 text-xs text-muted">
          {pricing.isConverted
            ? `Approx. ${pricing.currency.code} for visitors in ${pricing.country}. Final quote confirmed before payment.`
            : "Quote baseline. Final quote confirmed before payment."}
        </p>
        <div className="maple-divider mt-5" />

        <div className="mt-8 rounded-sm border border-line bg-paper p-5 shadow-sm sm:p-7">
          <h2 className="text-2xl text-ink">What’s included</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            {pkg.summary}
          </p>
          <ul className="mt-6 space-y-3">
            {pkg.includes.map((item) => (
              <li
                key={item}
                className="flex gap-3 border-t border-line pt-3 text-sm leading-relaxed text-ink sm:text-[0.95rem]"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <ButtonLink href={checkoutHref} className="w-full px-6 py-3.5 sm:w-auto">
            Proceed to checkout
          </ButtonLink>
          <ButtonLink
            href="/templates"
            variant="secondary"
            className="w-full px-6 py-3.5 sm:w-auto"
          >
            Browse templates
          </ButtonLink>
          <ButtonLink
            href={whatsappLink(packageWhatsappMessage(pkg.name))}
            variant="secondary"
            className="w-full px-6 py-3.5 sm:w-auto"
            external
          >
            WhatsApp
          </ButtonLink>
        </div>
      </section>

      <PackageTemplateSection packageSlug={pkg.slug} />

      <section className="border-t border-line bg-paper px-5 py-14 md:px-8 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-2xl text-ink sm:text-3xl">Ideal for</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              {pkg.idealFor}
            </p>
          </div>
          <aside className="h-fit border border-line bg-cream p-6 sm:p-7">
            <h3 className="text-lg text-ink">Ready to continue?</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Review your package, submit your details and CV, then we’ll
              confirm your quote and payment steps.
            </p>
            <p className="mt-4 text-sm font-semibold text-ink">
              {pkg.timeline}
              {pkg.region ? ` · ${pkg.region}` : ""}
            </p>
            <div className="mt-6">
              <ButtonLink href={checkoutHref} className="w-full">
                Proceed to checkout
              </ButtonLink>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
