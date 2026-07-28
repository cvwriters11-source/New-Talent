import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { SectionHeading } from "@/components/SectionHeading";
import { listPackages } from "@/lib/admin/store";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Graduate, Professional, Executive, and International Resume packages from Talent Crafters Career Development.",
};

export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  const packages = await listPackages();

  return (
    <div className="bg-cream">
      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <SectionHeading
          eyebrow="Packages"
          title="Support built for each stage of your career journey."
          description="Every package is delivered by Talent Crafters with clear scope, practical guidance, and direct communication."
        />

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {packages.map((pkg) => (
            <article
              key={pkg.slug}
              className="flex flex-col border border-line bg-paper p-7"
            >
              <h2 className="text-2xl text-ink">
                <Link
                  href={`/packages/${pkg.slug}`}
                  className="hover:text-teal"
                >
                  {pkg.name}
                </Link>
              </h2>
              {pkg.subtitle ? (
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal">
                  {pkg.subtitle}
                </p>
              ) : null}
              <p className="mt-2 text-sm font-semibold text-ink">
                {pkg.tagline}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                {pkg.summary}
              </p>
              <p className="mt-4 text-xs text-muted">
                {pkg.priceLabel} · {pkg.timeline}
                {pkg.region ? ` · ${pkg.region}` : ""}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href={`/packages/${pkg.slug}`}>
                  Package details
                </ButtonLink>
                <ButtonLink
                  href={`/packages/${pkg.slug}/checkout`}
                  variant="secondary"
                >
                  Proceed to checkout
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
