import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import {
  formatLocalizedAmount,
  type GeoPricing,
} from "@/lib/geo-pricing";
import type { CareerPackage } from "@/lib/packages";

const FEATURED_SLUG = "professional-package";
const MOBILE_VISIBLE_INCLUDES = 5;

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal sm:h-4 sm:w-4"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L8.75 11.836l6.543-6.543a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function PackagePricingGrid({
  packages,
  pricing,
  eyebrow = "Career Development packages",
  title = "Clear packages. Clear turnaround. Clear next steps.",
  description = "Pick the package that matches your stage — then proceed to checkout with your CV and details.",
}: {
  packages: CareerPackage[];
  pricing: GeoPricing;
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <div>
      <div className="max-w-2xl">
        <p className="section-label">{eyebrow}</p>
        <h2 className="mt-3 text-2xl text-ink sm:text-3xl md:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:mt-4 sm:text-base">
          {description}
        </p>
        <p className="mt-3 text-xs text-muted">
          Prices shown in{" "}
          <span className="font-semibold text-ink">{pricing.currency.code}</span>
          {pricing.isConverted
            ? ` for visitors in ${pricing.country} (approx. from ZAR quote baseline). Final quote confirmed before payment.`
            : " (quote baseline). Final quote confirmed before payment."}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        {packages.map((pkg) => {
          const featured = pkg.slug === FEATURED_SLUG;
          const previewIncludes = pkg.includes.slice(
            0,
            MOBILE_VISIBLE_INCLUDES,
          );
          const remaining = pkg.includes.length - previewIncludes.length;
          const local = formatLocalizedAmount(
            pkg.quoteAmount,
            pricing.currency,
          );

          return (
            <article
              key={pkg.slug}
              className={`flex flex-col border bg-white p-4 shadow-sm sm:p-6 ${
                featured ? "border-teal ring-1 ring-teal/30" : "border-line"
              }`}
            >
              {featured ? (
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal sm:text-[11px]">
                  Most chosen
                </p>
              ) : null}
              <h3
                className={`text-base font-bold sm:text-lg ${
                  featured ? "text-teal" : "text-ink"
                } ${featured ? "mt-1" : ""}`}
              >
                <Link href={`/packages/${pkg.slug}`} className="hover:underline">
                  {pkg.name}
                </Link>
              </h3>

              <div className="mt-3 sm:mt-4">
                <p className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  <span className="mr-1 text-sm font-semibold text-muted sm:text-base">
                    {local.code}
                  </span>
                  {local.formatted}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted sm:text-xs">
                  Quote baseline
                  {pricing.isConverted
                    ? ` · ~R ${Math.round(pkg.quoteAmount).toLocaleString("en-ZA")}`
                    : ""}
                </p>
              </div>

              <p className="mt-2 text-sm text-ink sm:mt-3">
                Turnaround:{" "}
                <span className="font-semibold">{pkg.timeline}</span>
                {pkg.region ? (
                  <span className="text-muted"> · {pkg.region}</span>
                ) : null}
              </p>

              <ul className="mt-4 space-y-2 text-[13px] leading-snug text-ink sm:mt-5 sm:space-y-2.5 sm:text-sm">
                {previewIncludes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {remaining > 0 ? (
                <Link
                  href={`/packages/${pkg.slug}`}
                  className="mt-2 text-xs font-semibold text-teal underline-offset-2 hover:underline"
                >
                  +{remaining} more inclusions
                </Link>
              ) : null}

              <div className="mt-5 flex flex-col gap-2 sm:mt-6">
                <ButtonLink
                  href={`/packages/${pkg.slug}/checkout`}
                  className="w-full justify-center px-4 py-3 text-sm"
                  variant={featured ? "primary" : "secondary"}
                >
                  Order now
                </ButtonLink>
                <Link
                  href={`/packages/${pkg.slug}`}
                  className="block py-1 text-center text-xs font-semibold text-muted underline-offset-2 hover:text-teal hover:underline"
                >
                  View details
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
